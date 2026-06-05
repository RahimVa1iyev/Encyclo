import { Link } from '@/lib/navigation';
import type { ReactNode } from 'react'

export function Badge({
  children,
  tone = 'accent',
}: {
  children: ReactNode
  tone?: 'accent' | 'muted' | 'outline'
}) {
  if (tone === 'outline') {
    return (
      <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium">
        {children}
      </span>
    )
  }
  if (tone === 'muted') {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        {children}
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)' }}
    >
      {children}
    </span>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-6 card-hover ${className}`}>
      {children}
    </div>
  )
}

export function CTAButton({
  children,
  href,
  to,
  variant = 'primary',
  className = '',
  onClick,
  type,
  style,
}: {
  children: ReactNode
  href?: string
  to?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  style?: React.CSSProperties
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold btn-press transition-colors'

  const inlineStyle =
    variant === 'primary'
      ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
      : variant === 'outline'
      ? { border: '1px solid var(--accent)', color: 'var(--accent)' }
      : variant === 'secondary'
      ? { border: '1px solid var(--border)', color: 'var(--foreground)' }
      : {}

  const cls = `${base} ${className}`

  if (to) {
    return (
      <Link href={to} className={cls} style={{ ...inlineStyle, ...style }}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={{ ...inlineStyle, ...style }}>
        {children}
      </a>
    )
  }
  return (
    <button type={type ?? 'button'} onClick={onClick} className={cls} style={{ ...inlineStyle, ...style }}>
      {children}
    </button>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  center?: boolean
}) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <div
          className="text-xs uppercase tracking-widest font-semibold mb-3"
          style={{ color: 'var(--accent)' }}
        >
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">{subtitle}</p>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
      <div
        className="mx-auto h-12 w-12 rounded-full grid place-items-center mb-4 text-lg"
        style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)' }}
      >
        ∅
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[]
}) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="opacity-50">›</span>}
          {it.href ? (
            <Link href={it.href} className="hover:text-accent transition-colors">
              {it.label}
            </Link>
          ) : (
            <span style={{ color: 'var(--foreground)' }} className="font-medium">
              {it.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
