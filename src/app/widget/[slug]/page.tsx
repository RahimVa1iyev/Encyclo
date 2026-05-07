import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function WidgetPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, translations:product_translations(*), company:companies(slug, logo_url, translations:company_translations(*))')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: 'white', padding: '12px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
        Son məhsullar
      </div>
      {products?.map((product) => {
        const t = product.translations?.[0]
        const ct = product.company?.translations?.[0]
        return (
          <a
            key={product.id}
            href={`${siteUrl}/encyclopedia/products/${product.slug}`}
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
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t?.name || product.slug}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{ct?.name}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" style={{ flexShrink: 0 }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        )
      })}
      <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '10px', color: '#d1d5db' }}>
        <a href={`${siteUrl}/encyclopedia`} target="_blank" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
          Encyclo.az tərəfindən
        </a>
      </div>
    </div>
  )
}
