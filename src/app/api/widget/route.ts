import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = Math.min(parseInt(searchParams.get('limit') || '5') || 5, 20)
  const type = searchParams.get('type') // 'companies' | 'products'

  const supabase = createServerSupabaseClient()

  if (type === 'products') {
    let query = supabase
      .from('products')
      .select(`
        id, slug, images, type, status,
        translations:product_translations(name, description, features, locale),
        company:companies(slug, logo_url, translations:company_translations(name))
      `)
      .eq('status', 'active')
      .eq('translations.locale', 'az')
      .order('created_at', { ascending: false })
      .limit(limit)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ data, type: 'products' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60',
      }
    })
  }

  // Default: companies
  let query = supabase
    .from('companies')
    .select(`
      id, slug, logo_url, website,
      translations:company_translations(name, description, locale),
      category:categories(name, slug)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, type: 'companies' }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=60',
    }
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
