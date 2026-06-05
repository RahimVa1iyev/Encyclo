import { withTranslation } from "@/lib/prisma-locale";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
    const locale = searchParams.get('locale') || 'az';

    if (!key) {
      return NextResponse.json({ error: 'invalid_key' }, { status: 403, headers: corsHeaders });
    }

    const site = await prisma.partnerSite.findFirst({
      where: { api_key: key, status: 'active' },
      select: { id: true, name: true, domain: true, category_id: true }
    });

    if (!site) {
      return NextResponse.json({ error: 'invalid_key' }, { status: 403, headers: corsHeaders });
    }

    const partnerCompanies = await prisma.partnerSiteCompany.findMany({
      where: { partner_site_id: site.id },
      select: { company_id: true, priority: true },
      orderBy: { priority: 'desc' }
    });

    const eligibleCompanyIds = (partnerCompanies?.map((pc: any) => pc.company_id).filter(Boolean) as string[]) || [];

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
          .map((s: any) => s.toLowerCase().trim())
          .filter((s: any) => s.length >= 3)
          .forEach((s: any) => signals.push(s));
      }
    } catch {}

    if (title) {
      decodeURIComponent(title)
        .toLowerCase()
        .split(/[\s\,\.\!\?\-\_]+/)
        .map((s: any) => s.trim())
        .filter((s: any) => s.length >= 3)
        .forEach((s: any) => signals.push(s));
    }

    const uniqueSignals = [...new Set(signals)];

    let matchedCategoryId: string | null = null;
    let matchedCategoryName: string | null = null;
    let matchMethod = 'none';

    if (uniqueSignals.length > 0) {
      const keywordMatches = await prisma.categoryKeyword.findMany({
        where: { keyword: { in: uniqueSignals }, locale },
        select: { category_id: true, weight: true }
      });

      if (keywordMatches && keywordMatches.length > 0) {
        const scores: Record<string, number> = {};
        keywordMatches.forEach((k: any) => {
          if (k.category_id) {
            scores[k.category_id] = (scores[k.category_id] || 0) + (k.weight || 1);
          }
        });

        const topEntry = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

        if (topEntry) {
          matchedCategoryId = topEntry[0];
          matchMethod = 'keyword';

          const cat = await prisma.category.findUnique({
            where: { id: matchedCategoryId },
            select: { name: true }
          });
          matchedCategoryName = cat?.name || null;
        }
      }
    }

    if (!matchedCategoryId) {
      try {
        const allCategories = await prisma.category.findMany({
          select: { id: true, name: true }
        });

        const categoryNames = allCategories?.map((c: any) => c.name).join(', ') || '';
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
          const matched = allCategories.find((c: any) =>
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

      const cat = await prisma.category.findUnique({
        where: { id: site.category_id },
        select: { name: true }
      });
      matchedCategoryName = cat?.name || null;
    }



    const productsData = await prisma.product.findMany({
      where: {
        company_id: { in: eligibleCompanyIds },
        status: 'active',
        ...(matchedCategoryId ? { category_id: matchedCategoryId } : {})
      },
      select: {
        id: true,
        slug: true,
        images: true,
        views: true,
        category_id: true,
        translations: { ...withTranslation(locale), select: { name: true, description: true, locale: true } },
        company: {
          select: {
            slug: true,
            translations: { ...withTranslation(locale), select: { name: true, locale: true } }
          }
        }
      },
      orderBy: { views: 'desc' },
      take: 6
    });

    const formattedProducts = (productsData || []).map((p: any) => ({
      slug: p.slug,
      name: p.translations?.[0]?.name || '',
      description: p.translations?.[0]?.description || '',
      image: p.images?.[0] || null,
      company_name: p.company?.translations?.[0]?.name || '',
      company_slug: p.company?.slug || '',
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
