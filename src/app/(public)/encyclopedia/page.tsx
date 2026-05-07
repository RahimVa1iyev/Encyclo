import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { Building2, Layout, ArrowRight } from 'lucide-react'
import SearchBar from '@/components/encyclopedia/SearchBar'

type ProductFeatures = {
  keywords?: string[]
  price?: string | number
  currency?: string
  price_type?: string
}

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
  const supabase = createServerSupabaseClient()

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

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8 max-w-3xl mx-auto py-10">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 px-4 py-1 rounded-full">
              Texnologiya Ensiklopediyası
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900">
              Azərbaycanın <span className="text-indigo-600">Texno</span> Dünyası
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Yerli şirkətləri, innovativ məhsulları və rəqəmsal xidmətləri kəşf edin. Ekosistemin bir hissəsi olun.
            </p>
          </div>
          
          <SearchBar />
        </section>

        {/* Categories Grid */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-900">Kateqoriyalar</h2>
              <p className="text-slate-500">Sahələr üzrə innovasiyaları araşdırın</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.map((category) => (
              <Link key={category.id} href={`/encyclopedia/categories/${category.slug}`}>
                <Card className="hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full group bg-white border-slate-100">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl group-hover:bg-indigo-50 transition-colors">
                      {getCategoryEmoji(category.slug)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{category.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {category.products?.[0]?.count || 0} məhsul
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Companies */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-900">Yeni Şirkətlər</h2>
              <p className="text-slate-500">Ekosistemə yeni qoşulan texnologiya oyunçuları</p>
            </div>
            <Link href="/encyclopedia/companies" className="hidden md:flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors group">
              Hamısına bax <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies?.map((company) => {
              const translation = company.translations?.find((t: any) => t.locale === 'az') || company.translations?.[0]
              return (
                <Link key={company.id} href={`/encyclopedia/companies/${company.slug}`}>
                  <Card className="group hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full bg-white border-slate-100 overflow-hidden">
                    <CardHeader className="p-6 flex flex-row items-center gap-5 space-y-0">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100 group-hover:border-indigo-100 transition-colors">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={translation?.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-black text-xl">
                            {translation?.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {translation?.name || company.slug}
                        </CardTitle>
                        <Badge variant="outline" className="mt-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-slate-100">
                          {company.category?.name}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-8">
                      <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                        {translation?.description || 'Təsvir əlavə edilməyib.'}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
          <div className="md:hidden pt-4">
            <Link href="/encyclopedia/companies" className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-slate-200 rounded-2xl text-indigo-600 font-bold">
              Hamısına bax <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Recent Products */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-900">Son Məhsullar</h2>
              <p className="text-slate-500">Ən son əlavə edilən rəqəmsal həllər</p>
            </div>
            <Link href="/encyclopedia/products" className="hidden md:flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors group">
              Hamısına bax <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => {
              const translation = product.translations?.[0]
              const companyTranslation = product.company?.translations?.[0]
              const isService = product.type === 'service'
              const features = (translation?.features || {}) as ProductFeatures
              return (
                <Link key={product.id} href={`/encyclopedia/products/${product.slug}`}>
                  <Card className="group hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 h-full bg-white border-slate-100 overflow-hidden flex flex-col">
                    <div className="h-48 overflow-hidden bg-slate-100 relative">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={translation?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Layout className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge className={isService ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'}>
                          {isService ? 'Xidmət' : 'Məhsul'}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-6 pb-2 space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded bg-slate-50 overflow-hidden border border-slate-100">
                          {product.company?.logo_url && (
                            <img src={product.company.logo_url} alt={companyTranslation?.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight truncate">
                          {companyTranslation?.name}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {translation?.name || product.slug}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 flex-1 flex flex-col justify-between">
                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6">
                        {translation?.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qiymət</span>
                          <span className="text-indigo-600 font-black text-lg">
                            {features.price ? (
                              `${features.price} ${features.currency || 'AZN'}`
                            ) : (
                              'Əlaqə saxlayın'
                            )}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
          <div className="md:hidden pt-4">
            <Link href="/encyclopedia/products" className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-slate-200 rounded-2xl text-indigo-600 font-bold">
              Hamısına bax <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
