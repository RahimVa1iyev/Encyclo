'use client' // ProductCard filter üçün lazımdır

import Link from 'next/link'
import { Badge } from './ui-kit'

export function CompanyCard({ company }: {
  company: {
    slug: string
    logo_url?: string | null
    translations?: Array<{ locale: string; name: string; description?: string | null }>
    category?: { name: string } | null
  }
}) {
  const t = company.translations?.find(t => t.locale === 'az') || company.translations?.[0]

  return (
    <Link href={`/companies/${company.slug}`} className="block rounded-2xl border border-border bg-surface p-6 card-hover">
      <div className="flex items-center gap-3">
        <div
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full font-black text-lg text-white animate-pulse"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {company.logo_url
            ? <img src={company.logo_url} alt={t?.name} className="h-full w-full rounded-full object-cover" />
            : t?.name?.charAt(0)?.toUpperCase()
          }
        </div>
        <div className="min-w-0">
          <div className="font-bold truncate">{t?.name || company.slug}</div>
          {company.category && (
            <div className="mt-1">
              <Badge>{company.category.name}</Badge>
            </div>
          )}
        </div>
      </div>
      {t?.description && (
        <p className="mt-4 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {t.description}
        </p>
      )}
    </Link>
  )
}

export function ProductCard({ product }: {
  product: {
    slug: string
    images?: string[] | null
    type?: string | null
    translations?: Array<{
      locale: string
      name: string
      description?: string | null
      features?: { price?: string | number; currency?: string } | null
    }>
    company?: {
      slug: string
      logo_url?: string | null
      translations?: Array<{ locale: string; name: string }>
    } | null
  }
}) {
  const t = product.translations?.find(t => t.locale === 'az') || product.translations?.[0]
  const ct = product.company?.translations?.find(t => t.locale === 'az') || product.company?.translations?.[0]
  const features = (t?.features || {}) as { price?: string | number; currency?: string }
  const isService = product.type === 'service'

  return (
    <Link href={`/products/${product.slug}`} className="block rounded-2xl border border-border bg-surface overflow-hidden card-hover">
      <div className="relative h-48 overflow-hidden bg-muted">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={t?.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge tone="outline">{isService ? 'Xidmət' : 'Məhsul'}</Badge>
        </div>
      </div>
      <div className="p-5">
        {product.company && (
          <div className="flex items-center gap-2 mb-2">
            <div
              className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-[10px] font-black text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {product.company.logo_url
                ? <img src={product.company.logo_url} alt={ct?.name} className="h-full w-full rounded-full object-cover" />
                : ct?.name?.charAt(0)?.toUpperCase()
              }
            </div>
            <span className="text-xs text-muted-foreground truncate">{ct?.name}</span>
          </div>
        )}
        <h3 className="font-bold">{t?.name || product.slug}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {t?.description}
        </p>
        <div className="mt-3 text-sm font-bold" style={{ color: 'var(--accent)' }}>
          {features.price
            ? `${features.price} ${features.currency || 'AZN'}`
            : 'Əlaqə saxlayın'}
        </div>
      </div>
    </Link>
  )
}
