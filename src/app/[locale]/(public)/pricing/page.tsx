import { siteConfig } from '@/lib/config';
import { Check, Zap, ArrowRight, Building2 } from "lucide-react";
import { Link } from '@/lib/navigation';
import { Badge, CTAButton } from "@/components/ui-kit";

export const metadata = {
  title: "Tariflər — Encyclo",
  description: "Encyclo platformasının tarif planları. Starter $49/ay, Growth $199/ay, Scale $599/ay.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/pricing`,
  },
  openGraph: {
    title: "Tariflər — Encyclo",
    description: "Encyclo platformasının tarif planları. Starter $49/ay, Growth $199/ay, Scale $599/ay.",
    type: "website",
  },
}

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "/ay",
    badge: null,
    popular: false,
    features: [
      "10 məhsul / xidmət",
      "Azərbaycan dili",
      "Ensiklopediya səhifəsi",
      "Widget embed kodu",
      "Əsas SEO optimizasiya",
      "Aylıq hesabat",
    ],
  },
  {
    name: "Growth",
    price: "$199",
    period: "/ay",
    badge: "Populyar",
    popular: true,
    features: [
      "50 məhsul / xidmət",
      "3 dil (AZ, EN, RU)",
      "Priority ensiklopediya",
      "Widget + API girişi",
      "AI məzmun optimallaşdırma",
      "FAQ & Forum sistemi",
      "Ətraflı analitika",
    ],
  },
  {
    name: "Scale",
    price: "$599",
    period: "/ay",
    badge: null,
    popular: false,
    features: [
      "Limitsiz məhsul",
      "8 dil",
      "Top ensiklopediya mövqeyi",
      "Xüsusi API inteqrasiyası",
      "Dedicated support",
      "White-label widget",
      "SLA zəmanəti",
    ],
  },
];

export default async function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Tariflər — Encyclo",
    "description": "Encyclo platformasının tarif planları.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/pricing`,
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
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
            Sadə və şəffaf tariflər
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-6" style={{ opacity: 0.85 }}>
            Şirkətinizin ölçüsünə uyğun plan seçin. Bütün planlarda pulsuz sınaq müddəti var.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <Zap className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            Hazırda beta — bütün xüsusiyyətlər pulsuzdur
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan: any) => (
            <div
              key={plan.name}
              className="rounded-3xl border bg-surface p-8 relative flex flex-col justify-between card-hover"
              style={{
                borderColor: plan.popular ? 'var(--accent)' : 'var(--border)',
                borderWidth: plan.popular ? '2px' : '1px',
              }}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge tone="accent">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <div>
                <div className="mb-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: any) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <CTAButton
                to="/register"
                className="w-full"
                variant={plan.popular ? 'primary' : 'outline'}
              >
                Başla
              </CTAButton>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-16 rounded-3xl border border-border bg-surface p-10 text-center max-w-4xl mx-auto">
          <div className="h-12 w-12 rounded-2xl border border-border bg-muted flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">Enterprise plan lazımdır?</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Xüsusi tələblər və geniş miqyaslı biznesiniz üçün bizimlə əlaqə saxlayın.
          </p>
          <div className="mt-6">
            <CTAButton
              href={`mailto:hello@${siteConfig.url.replace(/^https?:\/\//, '').split(':')[0]}`}
              variant="outline"
            >
              Əlaqə saxla <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
