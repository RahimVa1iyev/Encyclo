import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { Badge } from "@/components/ui-kit"
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SearchBar from '@/components/encyclopedia/SearchBar'
import { CompanyCard, ProductCard } from '@/components/cards'
import { generateCollectionSchema, renderSchemas } from '@/lib/schema'

export const metadata = {
  title: 'Ensiklopediya',
  description: 'Azərbaycan şirkətlərini, məhsullarını və xidmətlərini kəşf edin.',
  openGraph: {
    title: 'Encyclo Ensiklopediyası',
    description: 'Azərbaycan şirkətlərini, məhsullarını və xidmətlərini kəşf edin.',
    type: 'website',
  },
}

export default async function EncyclopediaPage() {
  const supabase = createPublicSupabaseClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('*, translations:company_translations(*), category:categories(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: categories } = await supabase
    .from('categories')
    .select('*, products(count)')
    .order('name')

  const { data: products } = await supabase
    .from('products')
    .select('*, translations:product_translations(*), company:companies(*, translations:company_translations(*))')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

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
  if (companies) {
    companies.forEach(c => collectionItems.push({ name: c.translations?.[0]?.name || c.slug, url: `/companies/${c.slug}` }));
  }

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
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight">Kateqoriyalar</h2>
            <p className="text-muted-foreground text-sm">Sahələr üzrə innovasiyaları araşdırın</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`} className="block rounded-2xl border border-border bg-surface p-5 text-center card-hover">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-3xl mx-auto mb-4">
                  {getCategoryEmoji(category.slug)}
                </div>
                <h3 className="font-bold text-sm truncate">{category.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {category.products?.[0]?.count || 0} məhsul
                </p>
              </Link>
            ))}
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
            {companies?.map((company) => (
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
            {products?.map((product) => (
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
