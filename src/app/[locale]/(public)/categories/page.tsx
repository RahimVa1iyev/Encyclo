import { prisma } from '@/lib/db'
import { Link } from '@/lib/navigation';
import { Breadcrumb, EmptyState } from '@/components/ui-kit'
import { generateCollectionSchema, generateBreadcrumbSchema, renderSchemas } from '@/lib/schema'
import { ArrowUpRight } from 'lucide-react'

export async function generateMetadata() {
  const description = 'Encyclo üzərindəki bütün şirkət və məhsul kateqoriyaları.'
  return {
    title: 'Kateqoriyalar — Encyclo',
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/categories`,
    },
    openGraph: {
      title: 'Kateqoriyalar — Encyclo',
      description,
    },
  }
}

export default async function CategoriesIndexPage() {
  const [
    categories,
    products,
    companies
  ] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.findMany({ where: { status: 'active' }, select: { category_id: true } }),
    prisma.company.findMany({ where: { status: 'active' }, select: { category_id: true } })
  ])

  // Countları hesablamaq
  const productCounts = products.reduce((acc: any, p: any) => {
    if (p.category_id) {
      acc[p.category_id] = (acc[p.category_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}

  const companyCounts = companies.reduce((acc: any, c: any) => {
    if (c.category_id) {
      acc[c.category_id] = (acc[c.category_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}

  const getCategoryEmoji = (slug: string) => {
    const mapping: Record<string, string> = {
      'software': '💻',
      'hardware': '🔌',
      'services': '🤝',
      'cloud': '☁️',
      'ai': '🤖',
      'security': '🛡️',
      'marketing': '📈',
      'education': '🎓',
    }
    return mapping[slug] || '📁'
  }

  // JSON-LD Structured Data
  const collectionItems: Array<{ name: string; url: string }> = []
  const categoriesWithCounts = categories.map((cat: any) => {
    collectionItems.push({ name: cat.name, url: `/categories/${cat.slug}` })
    return { ...cat, productCount: productCounts[cat.id] || 0, companyCount: companyCounts[cat.id] || 0 }
  })

  const collectionSchema = generateCollectionSchema(
    'Kateqoriyalar — Encyclo',
    'Bütün şirkət və məhsul kateqoriyaları.',
    '/categories',
    collectionItems
  )

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana səhifə', url: '/' },
    { name: 'Ensiklopediya', url: '/encyclopedia' },
    { name: 'Kateqoriyalar', url: '/categories' }
  ])

  return (
    <div className="min-h-screen py-16">
      {/* Structured Data */}
      {renderSchemas(collectionSchema, breadcrumbSchema)}

      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Ensiklopediya', href: '/encyclopedia' },
            { label: 'Kateqoriyalar' },
          ]}
        />

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">
            Kateqoriyalar
          </h1>
          <p className="text-muted-foreground font-medium">
            Encyclo platformasındakı bütün biznes və məhsul sahələri
          </p>
        </div>

        {categoriesWithCounts && categoriesWithCounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesWithCounts.map((cat: any) => (
              <Link href={`/categories/${cat.slug}`} key={cat.id} className="block group h-full">
                <div className="rounded-2xl border border-border bg-surface p-6 hover:border-accent transition-all h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl select-none">{getCategoryEmoji(cat.slug)}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted group-hover:bg-accent group-hover:text-accent-foreground transition-colors text-muted-foreground">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{cat.name}</h2>
                  <div className="mt-auto pt-4 flex items-center gap-4 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{companyCounts[cat.id] || 0} şirkət</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span>{productCounts[cat.id] || 0} məhsul</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Kateqoriya tapılmadı"
            description="Hazırda sistemdə heç bir kateqoriya yoxdur."
          />
        )}
      </div>
    </div>
  )
}
