import { Check, Zap, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Tariflər — Encyclo",
  description: "Encyclo platformasının tarif planları. Starter $49/ay, Growth $199/ay, Scale $599/ay.",
};

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "/ay",
    color: "border-gray-200",
    buttonColor: "bg-gray-900 hover:bg-gray-800",
    badge: null,
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
    color: "border-indigo-500",
    buttonColor: "bg-indigo-600 hover:bg-indigo-500",
    badge: "Populyar",
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
    color: "border-gray-200",
    buttonColor: "bg-gray-900 hover:bg-gray-800",
    badge: null,
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

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6">
            Sadə və şəffaf tariflər
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Şirkətinizin ölçüsünə uyğun plan seçin. Bütün planlarda pulsuz sınaq müddəti var.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
            <Zap className="h-4 w-4" />
            Hazırda beta — bütün xüsusiyyətlər pulsuzdur
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl border-2 ${plan.color} p-8 shadow-sm relative flex flex-col`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 text-xs font-bold bg-indigo-600 text-white rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`block w-full py-3 text-center text-sm font-semibold text-white rounded-xl transition-all active:scale-95 ${plan.buttonColor}`}
              >
                Başla
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-12 bg-gray-50 rounded-2xl border border-gray-100 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white rounded-2xl border border-gray-200 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Enterprise plan lazımdır?</p>
              <p className="text-sm text-gray-500 mt-0.5">Xüsusi tələblər üçün bizimlə əlaqə saxlayın</p>
            </div>
          </div>
          
          <a
            href="mailto:hello@encyclo.az"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex-shrink-0"
          >
            Əlaqə saxla <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
