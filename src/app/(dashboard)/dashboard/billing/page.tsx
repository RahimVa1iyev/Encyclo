"use client";

import { CreditCard, Check, Zap, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "/ay",
    color: "border-gray-200",
    badge: null,
    features: [
      "10 məhsul / xidmət",
      "Azərbaycan dili",
      "Ensiklopediya səhifəsi",
      "Widget embed kodu",
      "Əsas SEO optimizasiya",
    ],
  },
  {
    name: "Growth",
    price: "$199",
    period: "/ay",
    color: "border-indigo-500",
    badge: "Populyar",
    features: [
      "50 məhsul / xidmət",
      "3 dil (AZ, EN, RU)",
      "Priority ensiklopediya",
      "Widget + API girişi",
      "AI məzmun optimallaşdırma",
      "Aylıq hesabat",
    ],
  },
  {
    name: "Scale",
    price: "$599",
    period: "/ay",
    color: "border-gray-200",
    badge: null,
    features: [
      "Limitsiz məhsul",
      "8 dil",
      "Top ensiklopediya mövqeyi",
      "Xüsusi API inteqrasiyası",
      "Dedicated support",
      "White-label widget",
    ],
  },
];

export default function BillingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ödənişlər</h1>
        <p className="text-muted-foreground mt-1">Plan seçin və ya mövcud planınızı idarə edin</p>
      </div>

      {/* Coming soon banner */}
      <Card className="rounded-2xl border-indigo-100 bg-indigo-50/50 shadow-none">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-900">Ödəniş sistemi tezliklə aktiv olacaq</p>
            <p className="text-xs text-indigo-600 mt-0.5">Hazırda beta mərhələsindəsiniz — bütün funksiyalar pulsuzdur</p>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`rounded-2xl shadow-sm overflow-hidden border-2 ${plan.color} relative`}
          >
            {plan.badge && (
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 text-white rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="w-full py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
              >
                Tezliklə
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enterprise */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Enterprise plan lazımdır?</p>
              <p className="text-sm text-gray-500 mt-0.5">Xüsusi tələblər üçün bizimlə əlaqə saxlayın</p>
            </div>
          </div>
          <a
            href="mailto:hello@encyclo.az"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex-shrink-0"
          >
            Əlaqə saxla
            <ArrowRight className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
