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

  const [{ data: products }, { data: companies }] = await Promise.all([
    supabase
      .from('products')
      .select('*, translations:product_translations(*), company:companies(slug, logo_url, translations:company_translations(name))')
      .eq('status', 'active')
      .eq('category_id', category.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('companies')
      .select('*, translations:company_translations(*)')
      .eq('status', 'active')
      .eq('category_id', category.id)
      .order('created_at', { ascending: false })
  ])

  return (
    <div className="min-h-screen bg-slate-50/30 py-16">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        <div className="space-y-2">
          <Link href="/encyclopedia" className="text-sm text-indigo-600 font-bold hover:underline">
            ← Ensiklopediya
          </Link>
          <h1 className="text-4xl font-black text-slate-900">{category.name}</h1>
          <p className="text-slate-500">
            {companies?.length || 0} şirkət · {products?.length || 0} məhsul
          </p>
        </div>

        {/* Companies */}
        {companies && companies.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Şirkətlər</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => {
                const t = company.translations?.find((t: any) => t.locale === 'az') || company.translations?.[0]
                return (
                  <Link key={company.id} href={`/encyclopedia/companies/${company.slug}`}>
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:border-indigo-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border overflow-hidden flex-shrink-0">
                          {company.logo_url
                            ? <img src={company.logo_url} alt={t?.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-black">{t?.name?.charAt(0)}</div>
                          }
                        </div>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{t?.name}</h3>
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
            <h2 className="text-2xl font-black text-slate-900">Məhsullar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const t = product.translations?.find((t: any) => t.locale === 'az') || product.translations?.[0]
                const ct = (product.company as any)?.translations?.[0]
                const features = (t?.features || {}) as any
                return (
                  <Link key={product.id} href={`/encyclopedia/products/${product.slug}`}>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all group">
                      <div className="h-36 bg-slate-100 overflow-hidden">
                        {product.images?.[0]
                          ? <img src={product.images[0]} alt={t?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-8 h-8" /></div>
                        }
                      </div>
                      <div className="p-4">
                        <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">{ct?.name}</p>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{t?.name}</h3>
                        <p className="text-indigo-600 font-black text-sm mt-2">
                          {features.price ? `${features.price} ${features.currency || 'AZN'}` : 'Əlaqə saxlayın'}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {(!companies?.length && !products?.length) && (
          <div className="text-center py-20 text-slate-400">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <p>Bu kateqoriyada hələ heç bir məzmun yoxdur</p>
          </div>
        )}
      </div>
    </div>
  )
}
