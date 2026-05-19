import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <svg
            width="100"
            height="26"
            viewBox="0 0 100 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Encyclo"
          >
            <text
              x="0"
              y="20"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="20"
              fontWeight="700"
              fontStyle="italic"
              fill="var(--foreground)"
              letterSpacing="-0.3"
            >
              Encyclo
            </text>
          </svg>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
            Azərbaycanın ilk GEO platforması. Şirkətinizi AI axtarış sistemlərində görünən edin.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Məhsul
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/features" className="hover:text-accent transition-colors text-muted-foreground">Xüsusiyyətlər</Link></li>
            <li><Link href="/pricing" className="hover:text-accent transition-colors text-muted-foreground">Tariflər</Link></li>
            <li><Link href="/encyclopedia" className="hover:text-accent transition-colors text-muted-foreground">Ensiklopediya</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Şirkət
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-accent transition-colors text-muted-foreground">Haqqımızda</Link></li>
            <li><Link href="/companies" className="hover:text-accent transition-colors text-muted-foreground">Şirkətlər</Link></li>
            <li><Link href="/products" className="hover:text-accent transition-colors text-muted-foreground">Məhsullar</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Əlaqə
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="mailto:hello@encyclo.az" className="hover:text-accent transition-colors">
                hello@encyclo.az
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Encyclo. Bütün hüquqlar qorunur.
      </div>
    </footer>
  )
}
