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

  const companyUrls = (companies || []).map(c => ({
    url: `https://encyclo.az/companies/${c.slug}`,
    lastModified: c.updated_at || c.created_at,
  }))

  const productUrls = (products || []).map(p => ({
    url: `https://encyclo.az/products/${p.slug}`,
    lastModified: p.updated_at || p.created_at,
  }))

  const categoryUrls = (categories || []).map(c => ({
    url: `https://encyclo.az/categories/${c.slug}`,
    lastModified: c.created_at,
  }))

  return [
    { url: 'https://encyclo.az', lastModified: new Date() },
    { url: 'https://encyclo.az/encyclopedia', lastModified: new Date() },
    { url: 'https://encyclo.az/companies', lastModified: new Date() },
    { url: 'https://encyclo.az/products', lastModified: new Date() },
    ...categoryUrls,
    ...companyUrls,
    ...productUrls,
  ]
}
