import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap() {
  const [
    companies,
    products,
    categories,
  ] = await Promise.all([
    prisma.company.findMany({
      where: { status: 'active' },
      select: { slug: true, created_at: true }
    }),
    prisma.product.findMany({
      where: { status: 'active' },
      select: { slug: true, created_at: true }
    }),
    prisma.category.findMany({
      select: { slug: true, created_at: true }
    }),
  ])

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'

  const companyUrls = companies.map((c: any) => ({
    url: `${baseUrl}/companies/${c.slug}`,
    lastModified: c.created_at,
  }))

  const productUrls = products.map((p: any) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.created_at,
  }))

  const categoryUrls = categories.map((c: any) => ({
    url: `${baseUrl}/categories/${c.slug}`,
    lastModified: c.created_at,
  }))

  return [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/encyclopedia`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/companies`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    ...categoryUrls,
    ...companyUrls,
    ...productUrls,
  ]
}
