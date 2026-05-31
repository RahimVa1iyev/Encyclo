import { createPublicSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumb, EmptyState } from '@/components/ui-kit'
import { CompanyCard, ProductCard } from '@/components/cards'
import { generateCollectionSchema, generateBreadcrumbSchema, renderSchemas } from '@/lib/schema'

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = createPublicSupabaseClient()
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('category_id', category?.id || '')

  const { count: companyCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('category_id', category?.id || '')

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

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = createPublicSupabaseClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!category) notFound()

  const [{ data: products }, { data: companies }, { data: relatedCategories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, translations:product_translations(*), company:companies(slug, logo_url, translations:company_translations(name))')
      .eq('status', 'active')
      .eq('category_id', category.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('companies')
      .select('*, translations:company_translations(*), category:categories(*)')
      .eq('status', 'active')
      .eq('category_id', category.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .neq('id', category.id)
      .limit(10)
  ])

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
        {companies && companies.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight">Şirkətlər</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        {products && products.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight">Məhsullar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
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
              {relatedCategories.map((cat) => (
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
