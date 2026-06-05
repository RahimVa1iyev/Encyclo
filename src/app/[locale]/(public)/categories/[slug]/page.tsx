import { prisma } from '@/lib/db'
import { withTranslation, getTranslation } from '@/lib/prisma-locale';
import { Link } from '@/lib/navigation';
import { notFound } from 'next/navigation'
import { Breadcrumb, EmptyState } from '@/components/ui-kit'
import { CompanyCard, ProductCard } from '@/components/cards'
import { generateCollectionSchema, generateBreadcrumbSchema, renderSchemas } from '@/lib/schema'

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const category = await prisma.category.findUnique({
    where: { slug: params.slug }
  })

  const productCount = await prisma.product.count({
    where: { status: 'active', category_id: category?.id || '' }
  })

  const companyCount = await prisma.company.count({
    where: { status: 'active', category_id: category?.id || '' }
  })

  const name = category?.name || 'Kateqoriya'
  const description = `${name} kateqoriyasında ${companyCount || 0} şirkət və ${productCount || 0} məhsul — Encyclo`

  return {
    title: `${name} — Encyclo`,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/categories/${params.slug}`,
    },
    openGraph: {
      title: `${name} — Encyclo`,
      description,
    },
  }
}

export default async function CategoryPage(props: { params: Promise<{ slug: string, locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const category = await prisma.category.findUnique({
    where: { slug: params.slug }
  })

  if (!category) notFound()

  const [products, companies, relatedCategories] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'active', category_id: category.id },
      include: {
        translations: withTranslation(locale),
        company: {
          select: { slug: true, logo_url: true, translations: withTranslation(locale) }
        }
      },
      orderBy: { created_at: 'desc' }
    }),
    prisma.company.findMany({
      where: { status: 'active', category_id: category.id },
      include: { translations: withTranslation(locale), category: true },
      orderBy: { created_at: 'desc' }
    }),
    prisma.category.findMany({
      where: { id: { not: category.id } },
      take: 10
    })
  ])

  const activeCompanies = (companies || []);
  const recentProducts = (products || []);

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
  const collectionItems: Array<{ name: string; url: string }> = [];
  if (products) {
    products.forEach(p => collectionItems.push({ name: p.translations?.[0]?.name || p.slug, url: `/products/${p.slug}` }));
  }
  if (companies) {
    companies.forEach(c => collectionItems.push({ name: c.translations?.[0]?.name || c.slug, url: `/companies/${c.slug}` }));
  }

  const collectionSchema = generateCollectionSchema(
    `${category.name} — Azərbaycan şirkətləri və məhsulları`,
    `${category.name} kateqoriyasındakı Azərbaycan şirkətləri və məhsulları.`,
    `/categories/${category.slug}`,
    collectionItems
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana səhifə', url: '/' },
    { name: 'Ensiklopediya', url: '/encyclopedia' },
    { name: category.name, url: `/categories/${category.slug}` }
  ]);

  return (
    <div className="min-h-screen py-16">
      {/* Structured Data */}
      {renderSchemas(collectionSchema, breadcrumbSchema)}

      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Ensiklopediya', href: '/encyclopedia' },
            { label: category.name },
          ]}
        />

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">
            {getCategoryEmoji(category.slug)} {category.name}
          </h1>
          <p className="text-muted-foreground font-medium">
            {companies?.length || 0} şirkət · {products?.length || 0} məhsul bu kateqoriyada
          </p>
        </div>

        {/* Companies */}
        {activeCompanies && activeCompanies.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight">Şirkətlər</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCompanies.map((company: any) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        {recentProducts && recentProducts.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight">Məhsullar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {(!companies?.length && !products?.length) && (
          <EmptyState
            title="Bu kateqoriyada hələ heç bir məzmun yoxdur"
            description="Tezliklə yeni məlumatlar burada yayımlanacaq."
          />
        )}

        {/* Related Categories */}
        {relatedCategories && relatedCategories.length > 0 && (
          <section className="pt-12 border-t border-border space-y-6">
            <h2 className="text-xl font-black tracking-tight">Digər kateqoriyalar</h2>
            <div className="flex flex-wrap gap-3">
              {relatedCategories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="rounded-full border border-border bg-surface px-4 py-1.5 hover:border-accent transition-all text-sm font-semibold"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
