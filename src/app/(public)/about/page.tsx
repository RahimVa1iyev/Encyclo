import { ArrowRight, BookOpen, Globe, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Haqqında — Encyclo",
  description: "Encyclo — Azərbaycan şirkətlərinin məhsul və xidmətlərini AI axtarış sistemlərində görünən hala gətirən platforma.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-indigo-50/50 to-white py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6">
            Azərbaycan biznesini
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> AI dövrünə</span> hazırlayırıq
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Encyclo — Azərbaycan şirkətlərinin məhsul və xidmətlərini ensiklopediya formatında yayımlayan, ChatGPT, Perplexity və Google AI kimi sistemlərdə görünən hala gətirən B2B platformadır.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: BookOpen,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              title: "Missiyamız",
              desc: "Azərbaycan şirkətlərinin məhsullarını qlobal AI axtarış sistemlərində görünən etmək — dil baryerini aradan qaldırmaq.",
            },
            {
              icon: Globe,
              color: "text-blue-600",
              bg: "bg-blue-50",
              title: "Visionumuz",
              desc: "Hər Azərbaycan şirkətinin məhsulu 8 dildə, dünyanın istənilən yerindəki potensial müştəri tərəfindən tapıla bilsin.",
            },
            {
              icon: Zap,
              color: "text-violet-600",
              bg: "bg-violet-50",
              title: "Dəyərimiz",
              desc: "GEO — Generative Engine Optimization. Ənənəvi SEO-dan fərqli olaraq, AI sistemlərinin anlaya biləcəyi strukturlaşdırılmış məzmun.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
                <div className={`h-12 w-12 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Story */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 md:p-12 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Haqqımızda</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Encyclo 2024-cü ildə Azərbaycan texnologiya ekosistemindəki boşluğu doldurmaq məqsədilə yaradılıb. AI axtarış sistemlərinin sürətlə yayılması ilə birlikdə, şirkətlər yalnız Google-da deyil, ChatGPT, Perplexity kimi platformalarda da görünməli oldu.
            </p>
            <p>
              Biz Azərbaycan şirkətlərinin bu yeni dövrə hazır olmasına kömək edirik — məhsullarını strukturlaşdırılmış, çoxdilli və AI tərəfindən oxuna bilən formatda yayımlayırıq.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Əlaqə</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</p>
              <a href="mailto:hello@encyclo.az" className="text-indigo-600 font-semibold hover:underline">
                hello@encyclo.az
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Platforma</p>
              <Link href="/encyclopedia" className="text-indigo-600 font-semibold hover:underline">
                encyclo.az/encyclopedia
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
            >
              Platformaya qoşulun <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
