import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { Badge, Breadcrumb } from "@/components/ui-kit"
import Link from 'next/link'
import { Building2, Layout, Tag, DollarSign, Info, MessageSquare, Package } from 'lucide-react'
import { notFound } from 'next/navigation'
import ContactForm from '@/components/product/ContactForm'
import RedditForum from '@/components/forum/RedditForum'
import ProductTabBar from '@/components/ProductTabBar'


type ProductFeatures = {
  keywords?: string[]
  price?: string | number
  currency?: string
  price_type?: string
}

type ContactOptions = {
  website?: string
  phone?: string
  whatsapp?: string
  custom_url?: string
  custom_label?: string
  email?: string
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = createPublicSupabaseClient()
  const { data: product } = await supabase
    .from('products')
    .select('*, translations:product_translations(*), company:companies(translations:company_translations(name))')
    .eq('slug', params.slug)
    .single()

  if (!product) return { title: 'Məhsul tapılmadı' }

  const translation = product.translations?.find((t: any) => t.locale === 'az') || product.translations?.[0]
  const name = translation?.name || product.slug
  const description = translation?.meta_description || translation?.description || `${name} haqqında ətraflı məlumat.`
  const image = product.images?.[0]
  const companyName = (product.company as any)?.translations?.find((t: any) => t.locale === 'az')?.name || (product.company as any)?.translations?.[0]?.name

  return {
    title: translation?.meta_title || name,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/products/${params.slug}`,
    },
    openGraph: {
      type: 'website',
      title: `${translation?.meta_title || name} — ${companyName || 'Encyclo'}`,
      description,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: name }]
        : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: `${translation?.meta_title || name} — ${companyName || 'Encyclo'}`,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = createPublicSupabaseClient()

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
      .eq('is_faq', false)
      .is('parent_id', null),
    supabase
      .from('forum_posts')
      .select('id, author_name, content, created_at, parent_id')
      .eq('product_id', product.id)
      .eq('is_faq', false)
      .order('created_at', { ascending: true }),
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

  const translation = product.translations?.find((t: any) => t.locale === 'az') || product.translations?.[0]
  const companyTranslation = product.company?.translations?.find((t: any) => t.locale === 'az') || product.company?.translations?.[0]
  const isService = product.type === 'service'
  const features = (translation?.features || {}) as ProductFeatures
  const contactOptions = (product.contact_options || {}) as ContactOptions
  const leadsEnabled = product.leads_enabled === true

  const displayPhone = contactOptions.phone || product.company?.phone;
  const displayEmail = contactOptions.email || product.company?.email;
  const displayWebsite = contactOptions.website || product.company?.website;

  return (
    <div className="min-h-screen py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": isService ? "Service" : "Product",
            "name": translation?.name,
            "description": translation?.description,
            "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/products/${product.slug}`,
            "image": product.images && product.images.length > 0 ? product.images : undefined,
            "keywords": (features.keywords && features.keywords.length > 0) ? features.keywords.join(', ') : undefined,
            "brand": {
              "@type": "Brand",
              "name": companyTranslation?.name
            },
            "offers": {
              "@type": "Offer",
              ...(features.price ? {
                "price": String(features.price),
                "priceCurrency": features.currency || "AZN",
                "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                "availability": "https://schema.org/InStock",
              } : {}),
              "url": displayWebsite || undefined,
              "seller": {
                "@type": "Organization",
                "name": companyTranslation?.name,
                "telephone": displayPhone || undefined,
                "email": displayEmail || undefined,
                "url": displayWebsite || undefined
              }
            }
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
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/encyclopedia`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": product.company?.category?.name,
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/categories/${product.company?.category?.slug}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": companyTranslation?.name,
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/companies/${product.company?.slug}`
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": translation?.name || product.slug,
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/products/${product.slug}`
              }
            ]
          })
        }}
      />

      <div className="container mx-auto px-4 max-w-7xl space-y-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Ensiklopediya', href: '/encyclopedia' },
            { label: product.company?.category?.name || 'Kateqoriya', href: `/categories/${product.company?.category?.slug}` },
            { label: companyTranslation?.name || 'Şirkət', href: `/companies/${product.company?.slug}` },
            { label: translation?.name || product.slug },
          ]}
        />

        {/* Sticky Tab Bar */}
        {(() => {
          const tabList = [
            { id: 'overview', label: 'Məhsul' },
            ...(product.images && product.images.length > 0
              ? [{ id: 'gallery', label: 'Qalereya' }]
              : []),
            ...(faqPosts && faqPosts.length > 0
              ? [{ id: 'faq', label: `FAQ (${faqPosts.length})` }]
              : []),
            { id: 'forum', label: `Müzakirə (${forumCount || 0})` },
          ]
          return <ProductTabBar tabs={tabList} />
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <div id="overview" className="scroll-mt-24 space-y-6 bg-surface p-8 md:p-10 rounded-3xl border border-border">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="accent">
                  {isService ? 'Xidmət' : 'Məhsul'}
                </Badge>
                {features.price_type && (
                   <Badge tone="outline">
                    {features.price_type === 'Fixed' || features.price_type === 'fixed'
                      ? 'Sabit Qiymət'
                      : features.price_type === 'Starting from' || features.price_type === 'from'
                      ? 'Başlanğıc Qiymət'
                      : 'Sorğu ilə'}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                {translation?.name || product.slug}
              </h1>
              
              <p className="text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {translation?.description}
              </p>

              {features.keywords && features.keywords.length > 0 && (
                <div className="pt-8 border-t border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4 font-bold text-xs uppercase tracking-widest">
                    <Tag className="w-4 h-4" /> Açar sözlər
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {features.keywords.map((tag: string) => (
                      <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Images Grid */}
            {product.images && product.images.length > 0 && (
              <div id="gallery" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  <Layout className="w-6 h-6 text-muted-foreground" /> Qalereya
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.images.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-video rounded-2xl overflow-hidden border border-border bg-surface">
                      <img src={img} alt={`${translation?.name} ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {faqPosts && faqPosts.length > 0 && (
              <div id="faq" className="scroll-mt-24 space-y-6 pt-10 border-t border-border">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <Info className="w-6 h-6 text-muted-foreground" /> Tez-tez verilən suallar
                  </h2>
                  <Badge tone="accent">
                    {faqPosts.length}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {faqPosts.map((faq: any, idx: number) => (
                    <div key={idx} className="rounded-2xl border border-border bg-surface p-5 space-y-3">
                      <p className="font-bold flex gap-2">
                        <span style={{ color: 'var(--accent)' }}>S:</span> {faq.question}
                      </p>
                      <div className="h-px bg-border w-full" />
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {faq.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forum Section */}
            <section id="forum" className="scroll-mt-24 space-y-6 pt-10 border-t border-border">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <MessageSquare className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                Müzakirə
                {(forumCount || 0) > 0 && (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)' }}
                  >
                    {forumCount}
                  </span>
                )}
              </h2>
              <RedditForum
                productId={product.id}
                initialPosts={latestPosts || []}
              />
            </section>

            {relatedProducts && relatedProducts.length > 0 && (
              <div className="space-y-6 pt-10 border-t border-border">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-muted-foreground" /> Bu şirkətin digər məhsulları
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedProducts.map((rel: any) => {
                    const rt = rel.translations?.find((t: any) => t.locale === 'az') || rel.translations?.[0];
                    const rf = (rt?.features || {}) as ProductFeatures;
                    return (
                      <Link key={rel.id} href={`/products/${rel.slug}`}>
                        <div className="bg-surface rounded-2xl border border-border p-4 hover:shadow-xl hover:border-accent transition-all group flex flex-col h-full card-hover">
                          <div className="aspect-square bg-muted rounded-xl mb-3 overflow-hidden">
                            {rel.images?.[0] ? (
                              <img src={rel.images[0]} alt={rt?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-8 h-8" /></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground text-sm group-hover:text-accent transition-colors line-clamp-2">{rt?.name || rel.slug}</h4>
                          </div>
                          <p className="mt-2 text-xs font-black" style={{ color: 'var(--accent)' }}>
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
            <div className="rounded-2xl border border-border bg-surface overflow-hidden card-hover">
              <div className="h-1 w-full" style={{ backgroundColor: 'var(--accent)' }} />
              
              <div className="p-8 space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Təqdim edən şirkət</span>
                  <Link href={`/companies/${product.company?.slug}`} className="group flex items-center gap-3 p-2 -m-2 rounded-xl hover:bg-muted transition-colors">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white flex-shrink-0 overflow-hidden"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      {product.company?.logo_url ? (
                        <img src={product.company.logo_url} alt={companyTranslation?.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        companyTranslation?.name?.charAt(0)?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-accent transition-colors text-sm truncate max-w-[150px]">{companyTranslation?.name}</h3>
                      <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Şirkət profili →</p>
                    </div>
                  </Link>
                </div>

                <div className="space-y-6 pt-6 border-t border-border">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Qiymət</span>
                    <div className="text-3xl font-black" style={{ color: 'var(--accent)' }}>
                      {features.price ? (
                        <>
                          {features.price}
                          <span className="text-lg font-bold"> {features.currency || 'AZN'}</span>
                        </>
                      ) : (
                        <span className="text-2xl">Əlaqə saxlayın</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {displayWebsite && (
                      <a 
                        href={displayWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 text-center text-white font-black rounded-full shadow-lg transition-all active:scale-[0.98] text-sm btn-press"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        🌐 Vebsayta keç
                      </a>
                    )}
                    {displayPhone && (
                      <a 
                        href={`tel:${displayPhone}`}
                        className="block w-full py-3 text-center border border-border text-foreground font-black rounded-full hover:border-accent transition-colors text-sm btn-press"
                      >
                        📞 {displayPhone}
                      </a>
                    )}
                    {contactOptions.whatsapp && (
                      <a 
                        href={`https://wa.me/${contactOptions.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 text-center border border-green-500 text-green-600 font-black rounded-full hover:bg-green-50 transition-colors text-sm btn-press"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                    {contactOptions.custom_url && (
                      <a 
                        href={contactOptions.custom_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 text-center border font-black rounded-full hover:bg-muted transition-colors text-sm btn-press"
                        style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                      >
                        {contactOptions.custom_label || 'Ətraflı məlumat'}
                      </a>
                    )}
                    {leadsEnabled && (
                      <div className="pt-4 border-t border-border mt-4">
                         <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                          Birbaşa müraciət
                        </p>
                        <ContactForm
                          productId={product.id}
                          companyId={product.company_id}
                          productName={translation?.name || product.slug}
                        />
                      </div>
                    )}
                    {!displayWebsite && !displayPhone && !contactOptions.whatsapp && !contactOptions.custom_url && !leadsEnabled && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Əlaqə məlumatı əlavə edilməyib
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <DollarSign className="w-4 h-4 text-muted-foreground" /> 
                      {features.price_type === 'Contact us' || features.price_type === 'contact'
                        ? 'Qiymət sorğu əsasındadır'
                        : features.price_type === 'Starting from' || features.price_type === 'from'
                        ? 'Başlanğıc qiymətdir'
                        : 'Sabit qiymətdir'}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 block flex-shrink-0" />
                      Yayım statusu: Aktiv
                    </div>
                  </div>

                  {(faqPosts && faqPosts.length > 0 || (forumCount || 0) > 0) && (
                    <div className="pt-4 border-t border-border space-y-2">
                      {faqPosts && faqPosts.length > 0 && (
                        <a
                          href="#faq"
                          className="flex justify-between text-sm w-full py-1 font-semibold"
                          style={{ color: 'var(--accent)' }}
                        >
                          <span>Tez-tez verilən suallar</span>
                          <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold text-muted-foreground">
                            {faqPosts.length}
                          </span>
                        </a>
                      )}
                      <a
                        href="#forum"
                        className="flex justify-between text-sm w-full py-1 font-semibold"
                        style={{ color: 'var(--accent)' }}
                      >
                        <span>Forum müzakirəsi</span>
                        <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold text-muted-foreground">
                          {forumCount || 0}
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
