import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ companies: [], products: [] })
  }

  const supabase = await createServerSupabaseClient()

  const [{ data: companies }, { data: products }] = await Promise.all([
    supabase
      .from('company_translations')
      .select('name, company_id, companies(slug, logo_url, status)')
      .eq('locale', 'az')
      .ilike('name', `%${query}%`)
      .limit(5),
    supabase
      .from('product_translations')
      .select('name, product_id, products(slug, status, images, company:companies(slug, logo_url, translations:company_translations(name)))')
      .eq('locale', 'az')
      .ilike('name', `%${query}%`)
      .limit(5)
  ])

  const filteredCompanies = (companies || []).filter(
    (c: any) => (c.companies as any)?.status === 'active'
  )
  const filteredProducts = (products || []).filter(
    (p: any) => (p.products as any)?.status === 'active'
  )

  return NextResponse.json({
    companies: filteredCompanies,
    products: filteredProducts,
  })
}
