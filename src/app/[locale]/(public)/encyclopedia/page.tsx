import { siteConfig } from '@/lib/config';
import { prisma } from '@/lib/db'
import { withTranslation, getTranslation } from '@/lib/prisma-locale';
import { Badge } from "@/components/ui-kit"
import { Link } from '@/lib/navigation';
import { ArrowRight } from 'lucide-react'
import SearchBar from '@/components/encyclopedia/SearchBar'
import { CompanyCard, ProductCard } from '@/components/cards'
import { generateCollectionSchema, renderSchemas } from '@/lib/schema'



import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.encyclopedia' });
  
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteConfig.url}/${locale}`,
      languages: {
        'az': `${siteConfig.url}/az`,
        'en': `${siteConfig.url}/en`,
      }
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${siteConfig.url}/${locale}`,
      siteName: 'Encyclo',
      locale: locale === 'az' ? 'az_AZ' : 'en_US',
      alternateLocale: locale === 'az' ? ['en_US'] : ['az_AZ'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function EncyclopediaPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const companies = await prisma.company.findMany({
    where: { status: 'active' },
    include: {
      translations: withTranslation(locale),
      category: true,
    },
    orderBy: { created_at: 'desc' },
    take: 12,
  })

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' },
  })

  const products = await prisma.product.findMany({
    where: { status: 'active' },
    include: {
      translations: withTranslation(locale),
      company: {
        include: {
          translations: withTranslation(locale),
        }
      }
    },
    orderBy: { created_at: 'desc' },
    take: 12,
  })

  const getCategoryEmoji = (slug: string) => {
    const mapping: Record<string, string> = {
      'software': '💻',
      'hardware': '🔌',
      'services': '🤝',
      'cloud': '☁️',
      'ai': '🤖',
      'security': '🛡️',
      'marketing': '📈',
      'education': '🎓',
    }
    return mapping[slug] || '📁'
  }

  const collectionItems: Array<{ name: string; url: string }> = [];
  const latestCompanies = companies.filter((c: any) => c.status === 'active');
  latestCompanies.forEach((c: any) => collectionItems.push({ name: c.translations?.[0]?.name || c.slug, url: `/companies/${c.slug}` }));

  const collectionSchema = generateCollectionSchema(
    "Azərbaycan Texnologiya Ensiklopediyası",
    "Azərbaycan şirkətlərini, məhsullarını və xidmətlərini kəşf edin.",
    "/encyclopedia",
    collectionItems
  );

  return (
    <div className="min-h-screen">
      {renderSchemas(collectionSchema)}
      
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--hero-bg)', color: 'var(--hero-fg)' }} className="relative overflow-hidden py-24 text-center">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative container mx-auto px-4 max-w-3xl space-y-6">
          <Badge tone="accent">
            Texnologiya Ensiklopediyası
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
            Azərbaycanın <span style={{ color: 'var(--accent)' }}>Texno</span> Dünyası
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ opacity: 0.85 }}>
            Yerli şirkətləri, innovativ məhsulları və rəqəmsal xidmətləri kəşf edin. Ekosistemin bir hissəsi olun.
          </p>
          <div className="pt-4">
            <SearchBar />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20 space-y-24 max-w-7xl">
        {/* Categories Grid */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight">Kateqoriyalar</h2>
              <p className="text-muted-foreground text-sm">Sahələr üzrə innovasiyaları araşdırın</p>
            </div>
            <Link href="/categories" className="hidden md:flex items-center gap-1.5 font-bold text-sm transition-colors group" style={{ color: 'var(--accent)' }}>
              Bütün kateqoriyalar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category: any) => (
              <Link key={category.id} href={`/categories/${category.slug}`} className="block rounded-2xl border border-border bg-surface p-5 text-center card-hover">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-3xl mx-auto mb-4">
                  {getCategoryEmoji(category.slug)}
                </div>
                <h3 className="font-bold text-sm truncate">{category.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {category._count?.products || 0} məhsul
                </p>
              </Link>
            ))}
          </div>
          <div className="md:hidden pt-4">
            <Link href="/categories" className="flex items-center justify-center gap-2 w-full py-3.5 bg-surface border border-border rounded-full font-bold text-sm" style={{ color: 'var(--accent)' }}>
              Bütün kateqoriyalar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Featured Companies */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight">Yeni Şirkətlər</h2>
              <p className="text-muted-foreground text-sm">Ekosistemə yeni qoşulan texnologiya oyunçuları</p>
            </div>
            <Link href="/companies" className="hidden md:flex items-center gap-1.5 font-bold text-sm transition-colors group" style={{ color: 'var(--accent)' }}>
              Hamısına bax <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestCompanies.map((company: any) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
          <div className="md:hidden pt-4">
            <Link href="/companies" className="flex items-center justify-center gap-2 w-full py-3.5 bg-surface border border-border rounded-full font-bold text-sm" style={{ color: 'var(--accent)' }}>
              Hamısına bax <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Recent Products */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight">Son Məhsullar</h2>
              <p className="text-muted-foreground text-sm">Ən son əlavə edilən rəqəmsal həllər</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-1.5 font-bold text-sm transition-colors group" style={{ color: 'var(--accent)' }}>
              Hamısına bax <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
          <div className="md:hidden pt-4">
            <Link href="/products" className="flex items-center justify-center gap-2 w-full py-3.5 bg-surface border border-border rounded-full font-bold text-sm" style={{ color: 'var(--accent)' }}>
              Hamısına bax <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
