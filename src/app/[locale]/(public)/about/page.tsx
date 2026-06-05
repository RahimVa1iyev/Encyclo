import { siteConfig } from '@/lib/config';
import { ArrowRight, Target, Eye, Heart } from "lucide-react";
import { Link } from '@/lib/navigation';
import { Card, CTAButton } from "@/components/ui-kit";
import { renderSchemas } from '@/lib/schema'

export const metadata = {
  title: "Haqqında — Encyclo",
  description: "Encyclo — Azərbaycan şirkətlərinin məhsul və xidmətlərini AI axtarış sistemlərində görünən hala gətirən platforma.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/about`,
  },
  openGraph: {
    title: "Haqqında — Encyclo",
    description: "Encyclo — Azərbaycan şirkətlərinin məhsul və xidmətlərini AI axtarış sistemlərində görünən hala gətirən platforma.",
    type: "website",
  },
}

export default function AboutPage() {
  const aboutSchema = {
    "@type": "AboutPage",
    "name": "Haqqında — Encyclo",
    "description": "Encyclo — Azərbaycan şirkətlərinin məhsul və xidmətlərini AI axtarış sistemlərində görünən hala gətirən platforma.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/about`,
    "publisher": {
      "@type": "Organization",
      "name": "Encyclo",
      "url": process.env.NEXT_PUBLIC_SITE_URL || "https://encyclo-phi.vercel.app",
      "email": `hello@${siteConfig.url.replace(/^https?:\/\//, '').split(':')[0]}`,
      "foundingDate": "2024"
    }
  }

  const encycloOrgSchema = {
    "@type": "Organization",
    "name": "Encyclo",
    "description": "Azərbaycanın ilk Generative Engine Optimization (GEO) platforması",
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'
  }

  return (
    <div className="min-h-screen">
      {renderSchemas(aboutSchema, encycloOrgSchema)}
      {/* Hero */}
      <div style={{ backgroundColor: 'var(--hero-bg)', color: 'var(--hero-fg)' }} className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
            Azərbaycan biznesini <span style={{ color: 'var(--accent)' }}>AI dövrünə</span> hazırlayırıq
          </h1>
          <p className="text-lg md:text-xl leading-relaxed" style={{ opacity: 0.85 }}>
            Encyclo — Azərbaycan şirkətlərinin məhsul və xidmətlərini ensiklopediya formatında yayımlayan, ChatGPT, Perplexity və Google AI kimi sistemlərdə görünən hala gətirən B2B platformadır.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Target,
              title: "Missiyamız",
              desc: "Azərbaycan şirkətlərinin məhsullarını qlobal AI axtarış sistemlərində görünən etmək — dil baryerini aradan qaldırmaq.",
            },
            {
              icon: Eye,
              title: "Visionumuz",
              desc: "Hər Azərbaycan şirkətinin məhsulu çoxdilli formatda, dünyanın istənilən yerindəki potensial müştəri tərəfindən tapıla bilsin.",
            },
            {
              icon: Heart,
              title: "Dəyərimiz",
              desc: "GEO — Generative Engine Optimization. Ənənəvi SEO-dan fərqli olaraq, AI sistemlərinin anlaya biləcəyi strukturlaşdırılmış məzmun.",
            },
          ].map((item: any) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="text-center">
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)' }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            );
          })}
        </div>

        {/* Story */}
        <div className="rounded-3xl border border-border bg-surface p-8 md:p-12 mb-16">
          <h2 className="text-2xl font-bold mb-6">Haqqımızda</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Encyclo 2024-cü ildə Azərbaycan texnologiya ekosistemindəki boşluğu doldurmaq məqsədilə yaradılıb. AI axtarış sistemlərinin sürətlə yayılması ilə birlikdə, şirkətlər yalnız Google-da deyil, ChatGPT, Perplexity kimi platformalarda da görünməli oldu.
            </p>
            <p>
              Biz Azərbaycan şirkətlərinin bu yeni dövrə hazır olmasına kömək edirik — məhsullarını strukturlaşdırılmış, çoxdilli və AI tərəfindən oxuna bilən formatda yayımlayırıq.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-3xl border border-border bg-surface p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Əlaqə</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
            Hər hansı bir sualınız və ya təklifiniz var? Bizimlə əlaqə saxlayın və ya platformamıza qoşulun.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto mb-10">
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email</p>
              <a href={`mailto:hello@${siteConfig.url.replace(/^https?:\/\//, '').split(':')[0]}`} className="font-bold hover:text-accent transition-colors">
                hello@{siteConfig.url.replace(/^https?:\/\//, '').split(':')[0]}
              </a>
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Platforma</p>
              <Link href="/encyclopedia" className="font-bold hover:text-accent transition-colors">
                {siteConfig.url.replace(/^https?:\/\//, '').split(':')[0]}/encyclopedia
              </Link>
            </div>
          </div>
          <div className="pt-6 border-t border-border">
            <CTAButton to="/register" variant="primary">
              Platformaya qoşulun <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
