import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { ArrowLeft, Building2, Layout, Tag, DollarSign, Info } from 'lucide-react'
import { notFound } from 'next/navigation'

type ProductFeatures = {
  keywords?: string[]
  price?: string | number
  currency?: string
  price_type?: string
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: product } = await supabase
    .from('products')
    .select('*, translations:product_translations(*)')
    .eq('slug', params.slug)
    .single()

  if (!product) return { title: 'Məhsul tapılmadı' }

  const translation = product.translations?.[0]
  const name = translation?.name || product.slug
  
  return {
    title: `${name} — Ensiklopediya`,
    description: translation?.description || `${name} texnoloji həlli haqqında ətraflı məlumat.`,
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('*, translations:product_translations(*), company:companies(*, translations:company_translations(*))')
    .eq('slug', params.slug)
    .single()

  if (!product) notFound()

  const translation = product.translations?.[0]
  const companyTranslation = product.company?.translations?.[0]
  const isService = product.type === 'service'
  const features = (translation?.features || {}) as ProductFeatures
  
  return (
    <div className="min-h-screen bg-slate-50/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": isService ? "Service" : "Product",
            "name": translation?.name,
            "description": translation?.description,
            "offers": features.price ? {
              "@type": "Offer",
              "price": features.price,
              "priceCurrency": features.currency || "AZN",
            } : undefined,
          })
        }}
      />

      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-10">
        {/* Back Link */}
        <Link href={`/encyclopedia/companies/${product.company?.slug}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {companyTranslation?.name} profili
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <div className="space-y-6 bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={isService ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'}>
                  {isService ? 'Xidmət' : 'Məhsul'}
                </Badge>
                {features.price_type && (
                   <Badge variant="outline" className="border-slate-200 text-slate-400 font-medium">
                    {features.price_type === 'Fixed' ? 'Sabit Qiymət' : features.price_type === 'Starting from' ? 'Başlanğıc Qiymət' : 'Sorğu ilə'}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {translation?.name || product.slug}
              </h1>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                  {translation?.description}
                </p>
              </div>

              {features.keywords && features.keywords.length > 0 && (
                <div className="pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400 mb-4 font-bold text-xs uppercase tracking-widest">
                    <Tag className="w-4 h-4" /> Açar sözlər
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {features.keywords.map((tag: string) => (
                      <span key={tag} className="px-3 py-1.5 bg-slate-50 text-slate-500 text-sm font-bold rounded-xl border border-slate-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Images Grid */}
            {product.images && product.images.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Layout className="w-6 h-6 text-indigo-600" /> Qalereya
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.images.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-white">
                      <img src={img} alt={`${translation?.name} ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-100 shadow-xl shadow-indigo-100/20 bg-white overflow-hidden border-t-4 border-t-indigo-600">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Təqdim edən şirkət</span>
                  <Link href={`/encyclopedia/companies/${product.company?.slug}`} className="group flex items-center gap-4 p-3 -m-3 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                      {product.company?.logo_url ? (
                        <img src={product.company.logo_url} alt={companyTranslation?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold">
                          {companyTranslation?.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{companyTranslation?.name}</h3>
                      <p className="text-xs text-slate-400">Şirkət profili →</p>
                    </div>
                  </Link>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Qiymət</span>
                    <div className="flex items-baseline gap-1 text-3xl font-black text-indigo-600">
                      {features.price ? (
                        <>
                          {features.price}
                          <span className="text-lg font-bold">{features.currency || 'AZN'}</span>
                        </>
                      ) : (
                        <span className="text-2xl">Əlaqə saxlayın</span>
                      )}
                    </div>
                  </div>

                  <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
                    İndi müraciət et
                  </button>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <DollarSign className="w-4 h-4 text-indigo-400" /> 
                      {features.price_type === 'Contact us' ? 'Qiymət sorğu əsasındadır' : 'Dəqiq qiymət daxil edilib'}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <Info className="w-4 h-4 text-indigo-400" />
                      Yayım statusu: Aktiv
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
