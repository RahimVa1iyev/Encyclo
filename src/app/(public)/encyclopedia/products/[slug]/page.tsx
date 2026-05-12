import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { ArrowLeft, Building2, Layout, Tag, DollarSign, Info, MessageSquare, Package } from 'lucide-react'
import { notFound } from 'next/navigation'

type ProductFeatures = {
  keywords?: string[]
  price?: string | number
  currency?: string
  price_type?: string
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createServerSupabaseClient()
  const { data: product } = await supabase
    .from('products')
    .select('*, translations:product_translations(*), company:companies(translations:company_translations(name))')
    .eq('slug', params.slug)
    .single()

  if (!product) return { title: 'Məhsul tapılmadı' }

  const translation = product.translations?.find((t: any) => t.locale === 'az') || product.translations?.[0]
  const name = translation?.name || product.slug
  const description = translation?.description || `${name} haqqında ətraflı məlumat.`
  const image = product.images?.[0]
  const companyName = (product.company as any)?.translations?.[0]?.name

  return {
    title: name,
    description,
    alternates: {
      canonical: `https://encyclo-phi.vercel.app/encyclopedia/products/${params.slug}`,
    },
    openGraph: {
      type: 'website',
      title: `${name} — ${companyName || 'Encyclo'}`,
      description,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: name }]
        : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: `${name} — ${companyName || 'Encyclo'}`,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createServerSupabaseClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, translations:product_translations(*), company:companies(*, translations:company_translations(*), category:categories(*))')
    .eq('slug', params.slug)
    .single()

  if (!product) notFound()

  // Increment view count (fire and forget)
  supabase
    .rpc('increment_views', { product_id: product.id })
    .then(() => {}) // ignore result

  // Fetch forum posts count, last 3 posts, faq posts and related products
  const [{ count: forumCount }, { data: latestPosts }, { data: faqPosts }, { data: relatedProducts }] = await Promise.all([
    supabase
      .from('forum_posts')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', product.id)
      .eq('is_faq', false),
    supabase
      .from('forum_posts')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_faq', false)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('forum_posts')
      .select('question, content')
      .eq('product_id', product.id)
      .eq('is_faq', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('products')
      .select('*, translations:product_translations(*)')
      .eq('company_id', product.company_id)
      .eq('status', 'active')
      .neq('id', product.id)
      .limit(3)
  ])

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
      {faqPosts && faqPosts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqPosts.map((faq: any) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.content
                }
              }))
            })
          }}
        />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
                "name": product.company?.category?.name,
                "item": `https://encyclo-phi.vercel.app/encyclopedia/categories/${product.company?.category?.slug}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": companyTranslation?.name,
                "item": `https://encyclo-phi.vercel.app/encyclopedia/companies/${product.company?.slug}`
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": translation?.name || product.slug,
                "item": `https://encyclo-phi.vercel.app/encyclopedia/products/${product.slug}`
              }
            ]
          })
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link href="/encyclopedia" className="text-slate-400 hover:text-indigo-600 transition-colors">
            Ensiklopediya
          </Link>
          <span className="text-slate-300">/</span>
          <Link href={`/encyclopedia/categories/${product.company?.category?.slug}`} className="text-slate-400 hover:text-indigo-600 transition-colors">
            {product.company?.category?.name}
          </Link>
          <span className="text-slate-300">/</span>
          <Link href={`/encyclopedia/companies/${product.company?.slug}`} className="text-slate-400 hover:text-indigo-600 transition-colors">
            {companyTranslation?.name}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-indigo-600 truncate max-w-[200px]">{translation?.name || product.slug}</span>
        </nav>

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
            {/* FAQ Section */}
            {faqPosts && faqPosts.length > 0 && (
              <div className="space-y-6 pt-10 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Info className="w-6 h-6 text-indigo-600" /> Tez-tez verilən suallar
                  </h2>
                  <Badge className="bg-indigo-50 text-indigo-700 border-none px-2 py-0.5 rounded-lg text-xs font-bold">
                    {faqPosts.length}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {faqPosts.map((faq: any, idx: number) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                      <p className="font-bold text-slate-900 flex gap-2">
                        <span className="text-indigo-600">S:</span> {faq.question}
                      </p>
                      <div className="h-px bg-slate-50 w-full" />
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {faq.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forum Section */}
            <div className="space-y-6 pt-10 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <MessageSquare className="w-6 h-6 text-indigo-600" /> Forum müzakirəsi
                </h2>
                <Link 
                  href={`/encyclopedia/products/${product.slug}/forum`}
                  className="text-indigo-600 font-bold text-sm hover:underline"
                >
                  Hamısına bax ({forumCount || 0})
                </Link>
              </div>

              {latestPosts && latestPosts.length > 0 ? (
                <div className="grid gap-4">
                  {latestPosts.map((post: any) => (
                    <div key={post.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Anonim istifadəçi • {new Date(post.created_at).toLocaleDateString('az-AZ')}
                      </div>
                      <p className="text-slate-600 text-sm italic">"{post.content.slice(0, 150)}{post.content.length > 150 ? '...' : ''}"</p>
                    </div>
                  ))}
                  <Link 
                    href={`/encyclopedia/products/${product.slug}/forum`}
                    className="flex items-center justify-center py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl border border-dashed border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    Müzakirəyə qoşul
                  </Link>
                </div>
              ) : (
                <div className="bg-slate-50 p-10 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
                  <p className="text-slate-500 font-medium">Bu məhsul haqqında hələ heç bir müzakirə yoxdur.</p>
                  <Link 
                    href={`/encyclopedia/products/${product.slug}/forum`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    İlk müzakirəni başlat
                  </Link>
                </div>
              )}
            </div>
            {relatedProducts && relatedProducts.length > 0 && (
              <div className="space-y-6 pt-10 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Building2 className="w-6 h-6 text-indigo-600" /> Bu şirkətin digər məhsulları
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedProducts.map((rel: any) => {
                    const rt = rel.translations?.[0];
                    const rf = (rt?.features || {}) as ProductFeatures;
                    return (
                      <Link key={rel.id} href={`/encyclopedia/products/${rel.slug}`}>
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col h-full">
                          <div className="aspect-square bg-slate-50 rounded-xl mb-3 overflow-hidden">
                            {rel.images?.[0] ? (
                              <img src={rel.images[0]} alt={rt?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200"><Package className="w-8 h-8" /></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">{rt?.name || rel.slug}</h4>
                          </div>
                          <p className="mt-2 text-xs font-black text-indigo-600">
                            {rf.price ? `${rf.price} ${rf.currency || 'AZN'}` : 'Əlaqə saxlayın'}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
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

                  {product.company?.website ? (
                    <a 
                      href={product.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-4 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                    >
                      İndi müraciət et
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 bg-gray-100 text-gray-400 font-black rounded-2xl cursor-not-allowed"
                    >
                      Vebsayt mövcud deyil
                    </button>
                  )}
                  
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
