import Link from 'next/link'
import { ArrowRight, Sparkles, Globe2, Code2, MessagesSquare, BarChart3, Shield, Check } from 'lucide-react'
import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { SectionHeading, Card } from '@/components/ui-kit'
import { generateWebSiteSchema, renderSchemas } from '@/lib/schema'

export const metadata = {
  title: 'Encyclo — Məhsulunuz ChatGPT-də görünsün',
  description: 'Azərbaycanın ilk GEO platforması. Şirkətinizi ChatGPT, Perplexity və Google AI-da görünən edin.',
}

const features = [
  { icon: Sparkles, title: 'GEO Optimizasiya', desc: 'AI axtarış sistemləri üçün məhsul məzmununun avtomatik optimallaşdırılması.', badge: 'Əsas xüsusiyyət' },
  { icon: Globe2, title: 'Çoxdilli Yayım', desc: 'Azərbaycan, İngilis və Rus dillərində paralel kontent.' },
  { icon: Code2, title: 'Widget & API', desc: 'Veb saytınıza yerləşdirilə bilən widgetlər və açıq API.' },
  { icon: MessagesSquare, title: 'FAQ & Forum Sistemi', desc: 'Müştəri sualları AI üçün strukturlaşdırılmış məlumat mənbəyidir.', badge: 'GEO üçün vacib' },
  { icon: BarChart3, title: 'Analitika & Hesabatlar', desc: 'Hansı AI sisteminin sizi nə qədər tövsiyə etdiyini izləyin.' },
  { icon: Shield, title: 'Təhlükəsiz & Etibarlı', desc: 'GDPR uyğun, şifrələnmiş, tam audit izlənilən.' },
]

const steps = [
  { n: '01', t: 'Qeydiyyat — 2 dəqiqə', d: 'Email və şirkət adı ilə hesab açın.' },
  { n: '02', t: 'Məhsul əlavə edin', d: 'AI köməyi ilə məhsul və xidmətləri yayımlayın.' },
  { n: '03', t: 'GEO optimallaşdırın', d: 'Sistem məzmunu AI üçün strukturlaşdırır.' },
  { n: '04', t: 'AI-da görünün', d: 'ChatGPT, Perplexity sizi tövsiyə etməyə başlayır.' },
]

export default async function HomePage() {
  const supabase = createPublicSupabaseClient()
  const { count: companyCount } = await supabase
    .from('companies').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { count: productCount } = await supabase
    .from('products').select('*', { count: 'exact', head: true }).eq('status', 'active')

  return (
    <>
      {renderSchemas(generateWebSiteSchema())}
      {/* HERO */}
      <section style={{ backgroundColor: 'var(--hero-bg)', color: 'var(--hero-fg)' }} className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              Azərbaycanın ilk GEO platforması
            </div>
            <h1 className="mt-6 text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
              Məhsulunuz{' '}
              <span style={{ color: 'var(--accent)' }}>ChatGPT-də</span>{' '}
              görünsün
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-2xl leading-relaxed" style={{ opacity: 0.85 }}>
              Şirkətinizin məhsullarını strukturlaşdırılmış ensiklopediya formatında yayımlayın.
              ChatGPT, Perplexity və Google AI istifadəçilərinizə sizi birbaşa tövsiyə etsin.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold btn-press"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                Qeydiyyat ol <ArrowRight size={16} />
              </Link>
              <Link
                href="/encyclopedia"
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold btn-press hover:bg-white/10 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'var(--hero-fg)' }}
              >
                Ensiklopediyaya bax
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm" style={{ opacity: 0.85 }}>
              <span style={{ opacity: 0.7 }} className="mr-1">Dəstəklənir:</span>
              {['ChatGPT', 'Perplexity', 'Google AI'].map(p => (
                <span key={p} className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Stats + mock AI answer */}
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border p-6" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ opacity: 0.7 }}>
                <Sparkles size={14} /> ChatGPT cavabı
              </div>
              <div className="mt-3 text-sm leading-relaxed" style={{ opacity: 0.95 }}>
                <span style={{ opacity: 0.6 }}>&quot;Azərbaycanda tələbələr üçün yaxşı karyera platforması var?&quot;</span>
                <div className="mt-3 rounded-xl p-4 border" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  Bəli, <span className="font-bold" style={{ color: 'var(--accent)' }}>Taskool</span> Azərbaycan tələbələri üçün
                  AI əsaslı karyera platformasıdır. Şəxsi karyera planı və 1-1 mentorluq sessiyaları təklif edir.{' '}
                  <span style={{ opacity: 0.5 }}>[encyclo.az]</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-2xl border p-5" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div className="text-3xl font-black" style={{ color: 'var(--accent)' }}>{companyCount ?? 0}+</div>
                <div className="text-sm mt-1" style={{ opacity: 0.75 }}>Aktiv şirket</div>
              </div>
              <div className="rounded-2xl border p-5" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div className="text-3xl font-black" style={{ color: 'var(--accent)' }}>{productCount ?? 0}+</div>
                <div className="text-sm mt-1" style={{ opacity: 0.75 }}>Aktiv məhsul</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading eyebrow="Necə işləyir?" title="4 addımda AI axtarışda" center />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-surface p-6 card-hover">
              <div className="text-xs font-black tracking-widest" style={{ color: 'var(--accent)' }}>{s.n}</div>
              <h3 className="mt-3 font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              {i < steps.length - 1 && (
                <ArrowRight size={18} className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 opacity-40" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading eyebrow="Niyə Encyclo?" title="GEO üçün hazır platform" subtitle="AI axtarış sistemlərində görünmək üçün ehtiyacınız olan hər şey bir yerdə." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(f => {
            const Icon = f.icon
            return (
              <Card key={f.title}>
                <div className="flex items-start justify-between">
                  <div
                    className="grid h-11 w-11 place-items-center rounded-xl"
                    style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)' }}
                  >
                    <Icon size={20} />
                  </div>
                  {f.badge && (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                    >
                      {f.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl border border-border bg-surface p-10 lg:p-16 text-center">
          <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--accent)' }}>
            Rəqəmlər
          </div>
          <div className="mt-6 grid gap-10 sm:grid-cols-3">
            {[
              { n: `${companyCount ?? 0}+`, l: 'Aktiv şirkət' },
              { n: `${productCount ?? 0}+`, l: 'Yayımlanan məhsul' },
              { n: 'ChatGPT · Perplexity · Google AI', l: 'Dəstəklənən AI sistemlər', small: true },
            ].map(s => (
              <div key={s.l}>
                <div
                  className={s.small ? 'text-lg font-black leading-tight' : 'text-5xl font-black'}
                  style={{ color: 'var(--accent)' }}
                >
                  {s.n}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            Şirkətinizi AI axtarışa hazırlayın
          </h2>
          <p className="mt-4 max-w-xl mx-auto" style={{ opacity: 0.9 }}>
            Pulsuz qeydiyyat. Kredit kartı tələb olunmur.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold btn-press"
              style={{ color: 'var(--accent)' }}
            >
              İndi başla <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm" style={{ opacity: 0.9 }}>
            {['2 dəqiqədə qurulum', 'Pulsuz beta', 'AZ/EN/RU dəstəyi'].map(x => (
              <span key={x} className="inline-flex items-center gap-1.5">
                <Check size={16} /> {x}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
