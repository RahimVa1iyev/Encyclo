import { createPublicSupabaseClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const supabase = createPublicSupabaseClient()

  const [
    { data: companies },
    { data: products },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from('companies')
      .select('slug, created_at, updated_at')
      .eq('status', 'active'),
    supabase
      .from('products')
      .select('slug, created_at, updated_at')
      .eq('status', 'active'),
    supabase
      .from('categories')
      .select('slug, created_at'),
  ])

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'

  const companyUrls = (companies || []).map(c => ({
    url: `${baseUrl}/companies/${c.slug}`,
    lastModified: c.updated_at || c.created_at,
  }))

  const productUrls = (products || []).map(p => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updated_at || p.created_at,
  }))

  const categoryUrls = (categories || []).map(c => ({
    url: `${baseUrl}/categories/${c.slug}`,
    lastModified: c.created_at,
  }))

  return [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/encyclopedia`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/companies`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    ...categoryUrls,
    ...companyUrls,
    ...productUrls,
  ]
}
