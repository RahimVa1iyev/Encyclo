import Link from "next/link";
import { Search, Globe, Zap, TrendingUp, ArrowRight, Building2, BookOpen } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "AI Axtarışda tapılın",
    desc: "ChatGPT, Perplexity, Google AI kimi sistemlər məhsullarınızı birbaşa istifadəçilərə tövsiyə edir.",
  },
  {
    icon: Globe,
    title: "Çoxdilli yayım",
    desc: "Məhsullarınız 8 dildə ensiklopediyada yayımlanır — beynəlxalq bazara çıxış imkanı.",
  },
  {
    icon: Zap,
    title: "Widget inteqrasiyası",
    desc: "Partner xəbər saytlarında iframe widget vasitəsilə məhsullarınız minlərlə oxucuya çatır.",
  },
  {
    icon: TrendingUp,
    title: "GEO Optimizasiya",
    desc: "Generative Engine Optimization — AI axtarış sistemləri üçün xüsusi strukturlaşdırılmış məzmun.",
  },
];

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Gradient bg */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a78bfa] to-[#818cf8] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      {/* Hero */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="h-3.5 w-3.5" />
              Azərbaycanın Biznes Ensiklopediyası
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl leading-tight">
              Məhsullarınız AI axtarışda
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> tapılsın</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Encyclo — Azərbaycan şirkətlərinin məhsul və xidmətlərini ensiklopediya formatında yayımlayan B2B platforma. ChatGPT, Perplexity, Google AI kimi sistemlər məhsullarınızı istifadəçilərə tövsiyə edir.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/register"
                className="rounded-full bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all active:scale-95"
              >
                Pulsuz başla →
              </Link>
              <Link
                href="/encyclopedia"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-gray-700 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                <BookOpen className="h-4 w-4" />
                Ensiklopediaya bax
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 sm:py-24 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Necə işləyir?</h2>
            <p className="mt-3 text-gray-500">Şirkətinizi qeydiyyatdan keçirin — qalanını biz edirik</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { value: "500+", label: "Azərbaycan şirkəti" },
              { value: "8", label: "Dil dəstəyi" },
              { value: "3", label: "AI axtarış sistemi" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-black text-indigo-600">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 sm:py-24 bg-indigo-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl mb-4">
            Şirkətinizi AI axtarışa hazırlayın
          </h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
            Qeydiyyat pulsuzdur. İlk məhsulunuzu 5 dəqiqəyə əlavə edin.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 shadow-lg"
          >
            İndi başla
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
