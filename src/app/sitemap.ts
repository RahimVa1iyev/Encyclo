import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const supabase = createServerSupabaseClient()

  const [
    { data: companies },
    { data: products },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from('companies')
      .select('slug, created_at')
      .eq('status', 'active'),
    supabase
      .from('products')
      .select('slug, created_at')
      .eq('status', 'active'),
    supabase
      .from('categories')
      .select('slug, created_at'),
  ])

  const companyUrls = (companies || []).map(c => ({
    url: `https://encyclo.az/encyclopedia/companies/${c.slug}`,
    lastModified: c.created_at,
  }))

  const productUrls = (products || []).map(p => ({
    url: `https://encyclo.az/encyclopedia/products/${p.slug}`,
    lastModified: p.created_at,
  }))

  const categoryUrls = (categories || []).map(c => ({
    url: `https://encyclo.az/encyclopedia/categories/${c.slug}`,
    lastModified: c.created_at,
  }))

  return [
    { url: 'https://encyclo.az', lastModified: new Date() },
    { url: 'https://encyclo.az/encyclopedia', lastModified: new Date() },
    { url: 'https://encyclo.az/encyclopedia/companies', lastModified: new Date() },
    { url: 'https://encyclo.az/encyclopedia/products', lastModified: new Date() },
    { url: 'https://encyclo.az/forum', lastModified: new Date() },
    ...categoryUrls,
    ...companyUrls,
    ...productUrls,
  ]
}
