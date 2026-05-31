import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { Mail, MessageSquare, Package, Clock } from 'lucide-react'

export const metadata = {
  title: 'Müraciətlər — Encyclo Dashboard',
}

export default async function LeadsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!company) redirect('/onboarding')

  const { data: leads } = await supabase
    .from('leads')
    .select('*, product:products(slug, translations:product_translations(name, locale))')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  const newCount = leads?.filter(l => l.status === 'new').length || 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900">Müraciətlər</h1>
          <p className="text-slate-500 text-sm">
            Məhsullarınıza gələn müraciətlər
          </p>
        </div>
        {newCount > 0 && (
          <span className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-full">
            {newCount} yeni
          </span>
        )}
      </div>

      {/* Leads List */}
      {leads && leads.length > 0 ? (
        <div className="space-y-4">
          {leads.map((lead) => {
            const productName = lead.product?.translations?.find((t: any) => t.locale === 'az')?.name
              || lead.product?.translations?.[0]?.name
              || 'Məhsul'
            const isNew = lead.status === 'new'

            return (
              <div
                key={lead.id}
                className={`bg-white rounded-2xl border p-6 space-y-4 transition-all ${
                  isNew ? 'border-indigo-200 shadow-md shadow-indigo-50' : 'border-slate-100 shadow-sm'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{lead.name}</p>
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-sm text-indigo-600 hover:underline font-medium"
                      >
                        {lead.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isNew && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                        Yeni
                      </span>
                    )}
                  </div>
                </div>

                {/* Message */}
                {lead.message && (
                  <div className="flex gap-3 bg-slate-50 rounded-xl p-4">
                    <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 leading-relaxed">{lead.message}</p>
                  </div>
                )}

                {/* Bottom row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Package className="w-3.5 h-3.5" />
                    <span className="font-medium">{productName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(lead.created_at), "d MMMM yyyy, HH:mm", { locale: az })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-slate-300" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-900">Hələ müraciət yoxdur</p>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Məhsul səhifələrinizdə &quot;Müraciət göndər&quot; formu vasitəsilə müraciətlər burada görünəcək.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
