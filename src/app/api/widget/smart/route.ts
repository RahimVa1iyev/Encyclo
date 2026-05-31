import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'public, s-maxage=120'
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const url = searchParams.get('url');
    const title = searchParams.get('title');

    if (!key) {
      return NextResponse.json({ error: 'invalid_key' }, { status: 403, headers: corsHeaders });
    }

    const { data: site, error: siteError } = await supabase
      .from('partner_sites')
      .select('id, name, domain, category_id')
      .eq('api_key', key)
      .eq('status', 'active')
      .single();

    if (siteError || !site) {
      return NextResponse.json({ error: 'invalid_key' }, { status: 403, headers: corsHeaders });
    }

    const { data: partnerCompanies } = await supabase
      .from('partner_site_companies')
      .select('company_id, priority')
      .eq('partner_site_id', site.id)
      .order('priority', { ascending: false });

    const eligibleCompanyIds = partnerCompanies?.map(pc => pc.company_id) || [];

    if (eligibleCompanyIds.length === 0) {
      return NextResponse.json({
        site: { name: site.name, domain: site.domain },
        matched_category: null,
        products: []
      }, { headers: corsHeaders });
    }

    const signals: string[] = [];

    try {
      if (url) {
        new URL(url).pathname
          .split(/[\/\-\_\.]/)
          .map(s => s.toLowerCase().trim())
          .filter(s => s.length >= 3)
          .forEach(s => signals.push(s));
      }
    } catch {}

    if (title) {
      decodeURIComponent(title)
        .toLowerCase()
        .split(/[\s\,\.\!\?\-\_]+/)
        .map(s => s.trim())
        .filter(s => s.length >= 3)
        .forEach(s => signals.push(s));
    }

    const uniqueSignals = [...new Set(signals)];

    let matchedCategoryId: string | null = null;
    let matchedCategoryName: string | null = null;
    let matchMethod = 'none';

    if (uniqueSignals.length > 0) {
      const { data: keywordMatches, error: kwError } = await supabase
        .from('category_keywords')
        .select('category_id, weight')
        .in('keyword', uniqueSignals);

      if (keywordMatches && keywordMatches.length > 0) {
        const scores: Record<string, number> = {};
        keywordMatches.forEach(k => {
          scores[k.category_id] = (scores[k.category_id] || 0) + k.weight;
        });

        const topEntry = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

        if (topEntry) {
          matchedCategoryId = topEntry[0];
          matchMethod = 'keyword';

          const { data: cat } = await supabase
            .from('categories')
            .select('name')
            .eq('id', matchedCategoryId)
            .single();
          matchedCategoryName = cat?.name || null;
        }
      }
    }

    if (!matchedCategoryId) {
      try {
        const { data: allCategories } = await supabase
          .from('categories')
          .select('id, name');

        const categoryNames = allCategories?.map(c => c.name).join(', ') || '';
        const searchTitle = title ? decodeURIComponent(title) : '';

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            max_tokens: 20,
            messages: [
              {
                role: 'system',
                content: 'You are a category classifier. Reply with ONLY the exact category name from the list. No explanation.'
              },
              {
                role: 'user',
                content: `Title: "${searchTitle}"\nCategories: ${categoryNames}\nWhich matches best?`
              }
            ]
          })
        });

        const groqData = await groqRes.json();
        const aiAnswer = groqData.choices?.[0]?.message?.content?.trim();

        if (aiAnswer && allCategories) {
          const matched = allCategories.find(c =>
            c.name.toLowerCase() === aiAnswer.toLowerCase()
          );
          if (matched) {
            matchedCategoryId = matched.id;
            matchedCategoryName = matched.name;
            matchMethod = 'ai';
          }
        }
      } catch (e) {
        // console.log('>>> GROQ ERROR:', e);
      }
    }

    if (!matchedCategoryId && site.category_id) {
      matchedCategoryId = site.category_id;
      matchMethod = 'default';

      const { data: cat } = await supabase
        .from('categories')
        .select('name')
        .eq('id', site.category_id)
        .single();
      matchedCategoryName = cat?.name || null;
    }



    let productsQuery = supabase
      .from('products')
      .select(`
        id, slug, images, views, category_id,
        product_translations!inner(name, description, locale),
        companies!inner(slug, company_translations!inner(name, locale))
      `)
      .in('company_id', eligibleCompanyIds)
      .eq('status', 'active')
      .eq('product_translations.locale', 'az')
      .order('views', { ascending: false })
      .limit(6);

    if (matchedCategoryId) {
      productsQuery = productsQuery.eq('category_id', matchedCategoryId);
    }

    const { data: productsData, error: productsError } = await productsQuery;

    const formattedProducts = (productsData || []).map((p: any) => ({
      slug: p.slug,
      name: p.product_translations?.[0]?.name || '',
      description: p.product_translations?.[0]?.description || '',
      image: p.images?.[0] || null,
      company_name: p.companies?.company_translations?.[0]?.name || '',
      company_slug: p.companies?.slug || '',
      url: `${SITE_URL}/products/${p.slug}`
    }));

    return NextResponse.json({
      site: { name: site.name, domain: site.domain },
      matched_category: matchedCategoryName,
      match_method: matchMethod,
      products: formattedProducts
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Widget API Error:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500, headers: corsHeaders });
  }
}
