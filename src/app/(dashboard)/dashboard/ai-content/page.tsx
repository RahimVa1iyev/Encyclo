"use client";

import { Sparkles, Brain, Zap, Languages, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Brain,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Avtomatik məzmun optimallaşdırması",
    desc: "Məhsul təsvirinizi AI analiz edib GEO standartlarına uyğun şəkildə yenidən yazır.",
  },
  {
    icon: Languages,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Çoxdilli avtotərcümə",
    desc: "Seçdiyiniz dillərə peşəkar keyfiyyətdə avtomatik tərcümə — hər dil ayrıca SEO optimallaşdırılır.",
  },
  {
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "AI FAQ generasiyası",
    desc: "Məhsulunuz haqqında ən çox verilən sualları AI müəyyən edib cavablarla birgə əlavə edir.",
  },
  {
    icon: Sparkles,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "Schema markup avtomatikası",
    desc: "JSON-LD strukturunu AI avtomatik optimallaşdırır — ChatGPT ve Perplexity-də daha yaxşı görünürlük.",
  },
];

export default function AIContentPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Məzmun</h1>
        <p className="text-muted-foreground mt-1">Məhsullarınızı AI ilə optimallaşdırın</p>
      </div>

      {/* Coming soon banner */}
      <Card className="rounded-2xl border-purple-100 bg-purple-50/50 shadow-none">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-900">Bu funksiya hazırlanır</p>
            <p className="text-xs text-purple-600 mt-0.5">Growth və Scale plan istifadəçiləri üçün əlçatan olacaq</p>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="rounded-2xl border-gray-100 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <div className={`h-10 w-10 ${feature.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{feature.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900">Erkən giriş istəyirsiniz?</p>
            <p className="text-sm text-gray-500 mt-0.5">Waitlist-ə yazılın — hazır olanda ilk siz xəbər alacaqsınız</p>
          </div>
          <a
            href="mailto:hello@encyclo.az"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex-shrink-0"
          >
            Waitlist-ə yazıl
            <ArrowRight className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
