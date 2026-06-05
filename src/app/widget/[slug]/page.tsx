import { withTranslation } from "@/lib/prisma-locale";
import { prisma } from '@/lib/db'

export default async function WidgetPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.params;
  const search = await props.searchParams;
  const locale = (search?.locale as string) || "az";
  // 1. Şirkəti slug-a görə tap
  const company = await prisma.company.findFirst({
    where: { slug: params.slug, status: 'active' },
    select: {
      id: true,
      slug: true,
      logo_url: true,
      translations: { ...withTranslation(locale), select: { name: true, locale: true } }
    }
  })

  if (!company) {
    return (
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: 'white', padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
        Şirkət tapılmadı
      </div>
    )
  }

  // 2. Şirkətin məhsullarını çək
  const products = await prisma.product.findMany({
    where: { company_id: company.id, status: 'active' },
    include: {
      translations: withTranslation(locale)
    },
    orderBy: { created_at: 'desc' },
    take: 5
  })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const companyName = company.translations?.find((t: any) => t.locale === 'az')?.name
    || company.translations?.[0]?.name
    || company.slug

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: 'white', padding: '12px' }}>
      {/* Şirkət başlığı */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' }}>
        {company.logo_url && (
          <img src={company.logo_url} alt={companyName} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
        )}
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{companyName}</span>
      </div>

      <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Məhsul və Xidmətlər
      </div>

      {products && products.length > 0 ? (
        products.map((product: any) => {
          const t = product.translations?.find((tr: any) => tr.locale === 'az') || product.translations?.[0]
          return (
            <a
              key={product.id}
              href={`${siteUrl}/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f3f4f6', textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f3f4f6', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {product.images?.[0]
                  ? <img src={product.images[0]} alt={t?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '16px' }}>📦</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t?.name || product.slug}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {product.type === 'service' ? 'Xidmət' : 'Məhsul'}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          )
        })
      ) : (
        <div style={{ padding: '16px 0', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
          Hələ məhsul əlavə edilməyib
        </div>
      )}

      <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '10px', color: '#d1d5db' }}>
        <a href={`${siteUrl}/encyclopedia`} target="_blank" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
          Encyclo.az tərəfindən
        </a>
      </div>
    </div>
  )
}
