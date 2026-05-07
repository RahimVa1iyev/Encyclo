import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const supabase = createServerSupabaseClient()
  
  const { data: companies } = await supabase
    .from('companies')
    .select('slug, created_at')
    .eq('status', 'active')

  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at')
    .eq('status', 'active')

  const companyUrls = (companies || []).map(c => ({
    url: `https://encyclo.az/encyclopedia/companies/${c.slug}`,
    lastModified: c.created_at,
  }))

  const productUrls = (products || []).map(p => ({
    url: `https://encyclo.az/encyclopedia/products/${p.slug}`,
    lastModified: p.created_at,
  }))

  return [
    { url: 'https://encyclo.az', lastModified: new Date() },
    { url: 'https://encyclo.az/encyclopedia', lastModified: new Date() },
    ...companyUrls,
    ...productUrls,
  ]
}
