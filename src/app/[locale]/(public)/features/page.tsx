import { siteConfig } from '@/lib/config';
import { Search, Globe, Zap, Code2, BarChart3, MessageSquare, Shield, ArrowRight } from "lucide-react";
import { Link } from '@/lib/navigation';
import { Card, CTAButton, Badge } from "@/components/ui-kit";



const features = [
  {
    icon: Search,
    title: "GEO Optimizasiya",
    desc: "Generative Engine Optimization — məhsullarınız ChatGPT, Perplexity, Google AI kimi sistemlərdə axtarış nəticələrində birbaşa görünür. Strukturlaşdırılmış JSON-LD schema avtomatik əlavə edilir.",
    badge: "Əsas xüsusiyyət",
  },
  {
    icon: Globe,
    title: "Çoxdilli Yayım",
    desc: "Məhsullarınız Azərbaycan, ingilis və rus dillərində ayrıca optimallaşdırılmış səhifələrdə yayımlanır. Hər dil ayrıca SEO strukturuna malikdir.",
    badge: null,
  },
  {
    icon: Code2,
    title: "Widget & API İnteqrasiyası",
    desc: "Partner xəbər və portal saytları iframe widget vasitəsilə məhsullarınızı öz auditoriyasına göstərir. REST API ilə xüsusi inteqrasiya da mümkündür.",
    badge: null,
  },
  {
    icon: MessageSquare,
    title: "FAQ & Forum Sistemi",
    desc: "Məhsullarınıza tez-tez verilən sualları əlavə edin — FAQPage JSON-LD ilə işarələnir. AI axtarışlarda sual-cavab formatında birbaşa görünür.",
    badge: "GEO üçün vacib",
  },
  {
    icon: BarChart3,
    title: "Analitika & Hesabatlar",
    desc: "Məhsullarınızın baxış sayı, forum aktivliyi və performans göstəriciləri real vaxtda izlənilir. Hansı məhsulun daha çox diqqət çəkdiyini görün.",
    badge: null,
  },
  {
    icon: Shield,
    title: "Təhlükəsiz & Etibarlı",
    desc: "Hetzner PostgreSQL və Cloudflare R2 infrastrukturu üzərində qurulub. Row Level Security ilə məlumatlarınız yalnız sizə məxsusdur. Frankfurt serverləri — GDPR uyğun.",
    badge: null,
  },
];

import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.features' });
  
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

export default function FeaturesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Xüsusiyyətlər — Encyclo",
    "description": "Encyclo platformasının əsas xüsusiyyətləri — GEO optimizasiya, widget inteqrasiyası, çoxdilli yayım.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/features`,
    "publisher": {
      "@type": "Organization",
      "name": "Encyclo",
      "url": process.env.NEXT_PUBLIC_SITE_URL || "https://encyclo-phi.vercel.app"
    }
  }

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <div style={{ backgroundColor: 'var(--hero-bg)', color: 'var(--hero-fg)' }} className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-widest mb-6">
            <Zap className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
            Platforma Xüsusiyyətləri
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
            Məhsullarınızı AI axtarışa <span style={{ color: 'var(--accent)' }}>hazırlayın</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ opacity: 0.85 }}>
            Encyclo yalnız ensiklopediya deyil — Azərbaycan şirkətlərinin məhsullarını AI axtarış sistemlərində görünən hala gətirən GEO platformasıdır.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f: any) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="relative flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="h-12 w-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)' }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    {f.badge && (
                      <Badge tone="accent">
                        {f.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-3">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }} className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Başlamağa hazırsınız?</h2>
          <p className="max-w-md mx-auto mb-8 opacity-90 text-sm md:text-base">İndi beta mərhələsindəyik — bütün xüsusiyyətlər aktivdir. İlk məhsulunuzu 5 dəqiqəyə əlavə edin.</p>
          <CTAButton to="/register" className="bg-white hover:bg-white/90 btn-press animate-bounce" style={{ color: 'var(--accent)' }}>
            Pulsuz başla <ArrowRight className="h-4 w-4" />
          </CTAButton>
        </div>
      </div>
    </div>
  );
}
