'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'

const links = [
  { href: '/encyclopedia', label: 'Ensiklopediya' },
  { href: '/features', label: 'Xüsusiyyətlər' },
  { href: '/pricing', label: 'Tariflər' },
  { href: '/about', label: 'Haqqında' },
]

interface NavbarProps {
  initialIsLoggedIn?: boolean
}

export function Navbar({ initialIsLoggedIn = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-200"
      style={{
        backgroundColor: scrolled
          ? 'color-mix(in oklab, var(--nav-bg) 85%, transparent)'
          : 'var(--nav-bg)',
        color: 'var(--nav-fg)',
        backdropFilter: scrolled ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : undefined,
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <svg
            width="110"
            height="28"
            viewBox="0 0 110 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Encyclo"
          >
            <text
              x="0"
              y="22"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="22"
              fontWeight="700"
              fontStyle="italic"
              fill="var(--nav-fg)"
              letterSpacing="-0.4"
            >
              Encyclo
            </text>
          </svg>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-opacity hover:opacity-100"
              style={{ color: 'var(--nav-fg)', opacity: 0.85 }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeSwitcher />
          {initialIsLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm font-semibold btn-press"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium transition-opacity hover:opacity-100"
                style={{ color: 'var(--nav-fg)', opacity: 0.9 }}
              >
                Daxil ol
              </Link>
              <Link
                href="/register"
                className="rounded-full px-4 py-2 text-sm font-semibold btn-press"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                Qeydiyyat
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(v => !v)}
          aria-label="Menu"
          style={{ color: 'var(--nav-fg)' }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-3"
          style={{
            backgroundColor: 'var(--nav-bg)',
            borderColor: 'rgba(255,255,255,0.1)',
            color: 'var(--nav-fg)',
          }}
        >
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium py-1"
              style={{ color: 'var(--nav-fg)' }}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex items-center justify-between border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <ThemeSwitcher />
            <div className="flex gap-2">
              {initialIsLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-4 py-1.5 text-sm font-semibold"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium px-3 py-1.5"
                    style={{ color: 'var(--nav-fg)' }}
                  >
                    Daxil ol
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-full px-3 py-1.5 text-sm font-semibold"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                  >
                    Qeydiyyat
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
