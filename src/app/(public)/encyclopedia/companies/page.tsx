import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Bütün Şirkətlər — Encyclo',
  description: 'Azərbaycanın texnologiya şirkətləri',
  openGraph: {
    title: 'Bütün Şirkətlər — Encyclo',
    description: 'Azərbaycanın texnologiya şirkətləri',
  },
}

export default async function AllCompaniesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('*, translations:company_translations(*), category:categories(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50/30 py-16">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        <div className="space-y-2">
          <Link href="/encyclopedia" className="text-sm text-indigo-600 font-bold hover:underline">
            ← Ensiklopediya
          </Link>
          <h1 className="text-4xl font-black text-slate-900">Bütün Şirkətlər</h1>
          <p className="text-slate-500">{companies?.length || 0} şirkət tapıldı</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies?.map((company) => {
            const t = company.translations?.find((t: any) => t.locale === 'az') || company.translations?.[0]
            return (
              <Link key={company.id} href={`/encyclopedia/companies/${company.slug}`}>
                <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                      {company.logo_url
                        ? <img src={company.logo_url} alt={t?.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-black text-xl">{t?.name?.charAt(0)}</div>
                      }
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{t?.name || company.slug}</h3>
                      <Badge variant="outline" className="mt-1 text-[10px] text-slate-400 border-slate-100">
                        {(company.category as any)?.name}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {t?.description || 'Təsvir əlavə edilməyib.'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {(!companies || companies.length === 0) && (
          <div className="text-center py-20 text-slate-400">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <p>Hələ heç bir şirkət yoxdur</p>
          </div>
        )}
      </div>
    </div>
  )
}
