import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { notFound } from 'next/navigation'

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createServerSupabaseClient()
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()
  const name = category?.name || 'Kateqoriya'
  return {
    title: `${name} — Encyclo`,
    description: `${name} kateqoriyasındakı Azərbaycan şirkətləri və məhsulları.`,
    alternates: {
      canonical: `https://encyclo-phi.vercel.app/encyclopedia/categories/${params.slug}`,
    },
    openGraph: {
      title: `${name} — Encyclo`,
      description: `${name} kateqoriyasındakı Azərbaycan şirkətləri və məhsulları.`,
    },
  }
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createServerSupabaseClient()

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
      .select('*, translations:company_translations(*), products(count)')
      .eq('status', 'active')
      .eq('category_id', category.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .neq('id', category.id)
      .limit(10)
  ])

  // JSON-LD Structured Data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ensiklopediya",
        "item": "https://encyclo-phi.vercel.app/encyclopedia"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": category.name,
        "item": `https://encyclo-phi.vercel.app/encyclopedia/categories/${category.slug}`
      }
    ]
  };

  const itemListJsonLd = products && products.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${category.name} məhsulları`,
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://encyclo-phi.vercel.app/encyclopedia/products/${product.slug}`
    }))
  } : null;

  return (
    <div className="min-h-screen bg-slate-50/30 py-16">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link href="/encyclopedia" className="text-slate-400 hover:text-indigo-600 transition-colors">
            Ensiklopediya
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-indigo-600">{category.name}</span>
        </nav>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{category.name}</h1>
          <p className="text-slate-500 font-medium">
            {companies?.length || 0} şirkət · {products?.length || 0} məhsul bu kateqoriyada
          </p>
        </div>

        {/* Companies */}
        {companies && companies.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Şirkətlər</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => {
                const t = company.translations?.find((t: any) => t.locale === 'az') || company.translations?.[0]
                const productCount = (company as any).products?.[0]?.count || 0;
                
                return (
                  <Link key={company.id} href={`/encyclopedia/companies/${company.slug}`}>
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:border-indigo-200 transition-all group h-full">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                          {company.logo_url
                            ? <img src={company.logo_url} alt={t?.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-black text-xl">{t?.name?.charAt(0)}</div>
                          }
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{t?.name}</h3>
                          <p className="text-xs text-slate-400 font-bold">{productCount} məhsul</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Products */}
        {products && products.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Məhsullar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const t = product.translations?.find((t: any) => t.locale === 'az') || product.translations?.[0]
                const ct = (product.company as any)?.translations?.[0]
                const features = (t?.features || {}) as any
                return (
                  <Link key={product.id} href={`/encyclopedia/products/${product.slug}`}>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all group h-full flex flex-col">
                      <div className="h-48 bg-slate-100 overflow-hidden">
                        {product.images?.[0]
                          ? <img src={product.images[0]} alt={t?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><Package className="w-10 h-10" /></div>
                        }
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-1.5">{ct?.name}</p>
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{t?.name}</h3>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                          <p className="text-slate-900 font-black text-lg">
                            {features.price ? `${features.price} ${features.currency || 'AZN'}` : 'Qiymət üçün əlaqə'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {(!companies?.length && !products?.length) && (
          <div className="text-center py-32 bg-white rounded-3xl border border-slate-100 border-dashed">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <p className="text-slate-400 font-medium">Bu kateqoriyada hələ heç bir məzmun yoxdur</p>
          </div>
        )}

        {/* Related Categories */}
        {relatedCategories && relatedCategories.length > 0 && (
          <section className="pt-12 border-t border-slate-200 space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Digər kateqoriyalar</h2>
            <div className="flex flex-wrap gap-3">
              {relatedCategories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/encyclopedia/categories/${cat.slug}`}
                  className="px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-sm transition-all"
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
