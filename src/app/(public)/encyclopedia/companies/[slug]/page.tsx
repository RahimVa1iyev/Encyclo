import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { Globe, Layout, ArrowRight, Building2 } from 'lucide-react'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: company } = await supabase
    .from('companies')
    .select('*, translations:company_translations(*), category:categories(*)')
    .eq('slug', params.slug)
    .single()

  if (!company) return { title: 'Şirkət tapılmadı' }

  const translation = company.translations?.find((t: any) => t.locale === 'az') || company.translations?.[0]
  const name = translation?.name || company.slug
  const description = translation?.description || `${name} şirkəti haqqında ətraflı məlumat.`

  return {
    title: name,
    description,
    openGraph: {
      type: 'profile',
      title: `${name} — Encyclo`,
      description,
      images: company.logo_url
        ? [{ url: company.logo_url, width: 400, height: 400, alt: name }]
        : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${name} — Encyclo`,
      description,
      images: company.logo_url ? [company.logo_url] : undefined,
    },
  }
}

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient()
  
  const { data: company } = await supabase
    .from('companies')
    .select('*, translations:company_translations(*), category:categories(*)')
    .eq('slug', params.slug)
    .single()

  if (!company) notFound()

  const translation = company.translations?.[0]
  
  const { data: products } = await supabase
    .from('products')
    .select('*, translations:product_translations(*)')
    .eq('company_id', company.id)
    .eq('status', 'active')

  return (
    <div className="min-h-screen bg-slate-50/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": translation?.name,
            "description": translation?.description,
            "url": company?.website,
            "logo": company?.logo_url,
          })
        }}
      />

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Company Header */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 shadow-inner">
            {company.logo_url ? (
              <img src={company.logo_url} alt={translation?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-black text-4xl">
                {translation?.name?.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  {company.category?.name}
                </Badge>
                <Badge variant="outline" className="border-slate-200 text-slate-500">
                  Yerli Şirkət
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                {translation?.name || company.slug}
              </h1>
              {company.website && (
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  {new URL(company.website).hostname}
                </a>
              )}
            </div>
            
            <div className="prose prose-slate max-w-3xl">
              <p className="text-slate-600 text-lg leading-relaxed italic">
                {translation?.description || 'Şirkət haqqında ətraflı məlumat əlavə edilməyib.'}
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-indigo-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Məhsul və Xidmətlər</h2>
          </div>
          
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const pTrans = product.translations?.[0]
                const isService = product.type === 'service'
                return (
                  <Link key={product.id} href={`/encyclopedia/products/${product.slug}`}>
                    <Card className="group hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 h-full bg-white border-slate-100 overflow-hidden flex flex-col">
                      <div className="h-40 overflow-hidden bg-slate-100 relative">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={pTrans?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Layout className="w-10 h-10" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge className={isService ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'}>
                            {isService ? 'Xidmət' : 'Məhsul'}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {pTrans?.name || product.slug}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-2 flex-1 flex flex-col justify-between">
                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6">
                          {pTrans?.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <span className="text-indigo-600 font-black">
                            {pTrans?.features?.price ? (
                              `${pTrans.features.price} ${pTrans.features.currency || 'AZN'}`
                            ) : (
                              'Əlaqə saxlayın'
                            )}
                          </span>
                          <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Hələlik heç bir məhsul əlavə edilməyib.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
