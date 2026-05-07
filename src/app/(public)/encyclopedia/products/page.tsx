import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Bütün Məhsullar — Encyclo',
  description: 'Azərbaycanın texnologiya məhsulları və xidmətləri',
  openGraph: {
    title: 'Bütün Məhsullar — Encyclo',
    description: 'Azərbaycanın texnologiya məhsulları və xidmətləri',
  },
}

export default async function AllProductsPage() {
  const supabase = createServerSupabaseClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, translations:product_translations(*), company:companies(slug, logo_url, translations:company_translations(name))')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50/30 py-16">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        <div className="space-y-2">
          <Link href="/encyclopedia" className="text-sm text-indigo-600 font-bold hover:underline">
            ← Ensiklopediya
          </Link>
          <h1 className="text-4xl font-black text-slate-900">Bütün Məhsullar</h1>
          <p className="text-slate-500">{products?.length || 0} məhsul tapıldı</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => {
            const t = product.translations?.find((t: any) => t.locale === 'az') || product.translations?.[0]
            const companyTranslations = (product.company as any)?.translations
            const ct = companyTranslations?.find((t: any) => t.locale === 'az') || companyTranslations?.[0]
            const features = (t?.features || {}) as any
            const isService = product.type === 'service'
            return (
              <Link key={product.id} href={`/encyclopedia/products/${product.slug}`}>
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all group flex flex-col">
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={t?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-10 h-10" /></div>
                    }
                    <div className="absolute top-3 right-3">
                      <Badge className={isService ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}>
                        {isService ? 'Xidmət' : 'Məhsul'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded bg-slate-50 overflow-hidden border border-slate-100">
                        {(product.company as any)?.logo_url && (
                          <img src={(product.company as any).logo_url} alt={ct?.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase truncate">{ct?.name}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">{t?.name || product.slug}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 flex-1">{t?.description}</p>
                    <div className="mt-4 pt-3 border-t border-slate-50">
                      <span className="text-indigo-600 font-black text-sm">
                        {features.price ? `${features.price} ${features.currency || 'AZN'}` : 'Əlaqə saxlayın'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {(!products || products.length === 0) && (
          <div className="text-center py-20 text-slate-400">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <p>Hələ heç bir məhsul yoxdur</p>
          </div>
        )}
      </div>
    </div>
  )
}
