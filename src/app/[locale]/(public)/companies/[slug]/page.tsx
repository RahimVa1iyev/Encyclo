import { siteConfig } from '@/lib/config';
import { prisma } from '@/lib/db'
import { withTranslation, getTranslation } from '@/lib/prisma-locale';
import { Badge, Breadcrumb, EmptyState } from "@/components/ui-kit"
import { Link } from '@/lib/navigation';
import { Globe, ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/cards'
import { generateOrganizationSchema, generateBreadcrumbSchema, renderSchemas } from '@/lib/schema'

export async function generateMetadata(props: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await props.params;
  const company = await prisma.company.findFirst({
    where: { slug, status: 'active' },
    include: {
      translations: { where: { locale } }
    }
  });

  if (!company) return { title: 'Şirkət tapılmadı' };

  const translation = company.translations[0] 
    ?? await prisma.companyTranslation.findFirst({ 
      where: { company_id: company.id, locale: 'az' } 
    });

  const name = translation?.name || company.slug;
  const description = translation?.meta_description || translation?.description || '';

  return {
    title: `${name} | Encyclo`,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${locale}/companies/${slug}`,
      languages: {
        'az': `${siteConfig.url}/az/companies/${slug}`,
        'en': `${siteConfig.url}/en/companies/${slug}`,
      }
    },
    openGraph: {
      title: `${name} | Encyclo`,
      description,
      url: `${siteConfig.url}/${locale}/companies/${slug}`,
      type: 'website',
      images: company.logo_url
        ? [{ url: company.logo_url, width: 400, height: 400, alt: name }]
        : [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | Encyclo`,
      description,
      images: company.logo_url ? [company.logo_url] : ['/og-default.png'],
    },
  };
}

export default async function CompanyPage(props: { params: Promise<{ slug: string, locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const company = await prisma.company.findFirst({
    where: { slug: params.slug, status: 'active' },
    include: {
      translations: withTranslation(locale),
      category: true,
      socialLinks: true,
    }
  })

  if (!company) notFound()

  const translation = company.translations?.find((t: any) => t.locale === 'az') || company.translations?.[0]

  const products = await prisma.product.findMany({
    where: { company_id: company.id, status: 'active' },
    include: { translations: withTranslation(locale) }
  })

  const orgSchema = generateOrganizationSchema(company, company.category)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana səhifə', url: '/' },
    { name: company.category?.name || 'Kateqoriya', url: `/categories/${company.category?.slug}` },
    { name: translation?.name || '', url: `/companies/${company.slug}` }
  ])

  return (
    <div className="min-h-screen py-16">
      {renderSchemas(orgSchema, breadcrumbSchema)}

      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Ensiklopediya', href: '/encyclopedia' },
            { label: company.category?.name || 'Kateqoriya', href: `/categories/${company.category?.slug}` },
            { label: translation?.name || company.slug },
          ]}
        />

        {/* Company Header */}
        <div className="rounded-3xl border border-border bg-surface p-8 lg:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left card-hover">
          <div
            className="h-20 w-20 rounded-2xl grid place-items-center font-black text-2xl text-white flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {company.logo_url ? (
              <img src={company.logo_url} alt={translation?.name} className="h-full w-full object-cover rounded-2xl" />
            ) : (
              translation?.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          
          <div className="flex-1 space-y-4 min-w-0">
            <div className="space-y-2">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge tone="accent">
                  {company.category?.name}
                </Badge>
              </div>
              <h1 className="text-4xl font-black">
                {translation?.name || company.slug}
              </h1>
              {company.website && (
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 font-bold hover:underline text-sm"
                  style={{ color: 'var(--accent)' }}
                >
                  <Globe className="w-4 h-4" />
                  {(() => {
                    try {
                      return new URL(company.website).hostname;
                    } catch {
                      return company.website;
                    }
                  })()}
                </a>
              )}
            </div>
            
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              {translation?.description || 'Şirkət haqqında ətraflı məlumat əlavə edilməyib.'}
            </p>

            {/* Contact Chips inside header info block */}
            {(company.phone || company.email || translation?.address) && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {company.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:border-accent transition-colors text-foreground font-medium"
                  >
                    <span>📞</span> {company.phone}
                  </a>
                )}
                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:border-accent transition-colors text-foreground font-medium"
                  >
                    <span>✉️</span> {company.email}
                  </a>
                )}
                {translation?.address && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground font-medium">
                    <span>📍</span> {translation.address}
                  </span>
                )}
              </div>
            )}

            {/* Social links */}
            {company.socialLinks && company.socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {company.socialLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-accent hover:border-accent transition-colors"
                  >
                    {link.platform === 'linkedin' && '🔗'}
                    {link.platform === 'twitter' && '𝕏'}
                    {link.platform === 'facebook' && '📘'}
                    {link.platform === 'instagram' && '📷'}
                    {link.platform === 'youtube' && '▶️'}
                    {link.platform === 'website' && '🌐'}
                    {!['linkedin','twitter','facebook','instagram','youtube','website'].includes(link.platform) && '🔗'}
                    {' '}{link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <section className="space-y-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
            <h2 className="text-2xl font-black">Məhsul və Xidmətlər</h2>
          </div>
          
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={{ ...product, company }} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Hələlik heç bir məhsul əlavə edilməyib."
              description="Bu şirkət tərəfindən hələlik heç bir məhsul və ya xidmət təklif edilmir."
            />
          )}
        </section>
  
        {/* Related Category link */}
        {company.category && (
          <div className="pt-10 border-t border-border">
            <div className="rounded-2xl border border-border bg-surface p-6 card-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Əlaqəli kateqoriya</p>
                <h4 className="text-lg font-bold">{company.category.name}</h4>
              </div>
              <Link 
                href={`/categories/${company.category.slug}`}
                className="inline-flex items-center gap-1.5 font-bold text-sm hover:underline transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                Kateqoriyaya bax <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
