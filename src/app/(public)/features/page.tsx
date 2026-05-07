import { Search, Globe, Zap, Code2, BarChart3, MessageSquare, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Xüsusiyyətlər — Encyclo",
  description: "Encyclo platformasının əsas xüsusiyyətləri — GEO optimizasiya, widget inteqrasiyası, çoxdilli yayım.",
};

const features = [
  {
    icon: Search,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "GEO Optimizasiya",
    desc: "Generative Engine Optimization — məhsullarınız ChatGPT, Perplexity, Google AI kimi sistemlərdə axtarış nəticələrində birbaşa görünür. Strukturlaşdırılmış JSON-LD schema avtomatik əlavə edilir.",
    badge: "Əsas xüsusiyyət",
  },
  {
    icon: Globe,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Çoxdilli Yayım",
    desc: "Məhsullarınız 8 dildə — AZ, EN, RU, DE, FR, ES, TR, ZH — ayrıca optimallaşdırılmış səhifələrdə yayımlanır. Hər dil ayrıca SEO strukturuna malikdir.",
    badge: null,
  },
  {
    icon: Code2,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Widget & API İnteqrasiyası",
    desc: "Partner xəbər və portal saytları iframe widget vasitəsilə məhsullarınızı öz auditoriyasına göstərir. REST API ilə xüsusi inteqrasiya da mümkündür.",
    badge: null,
  },
  {
    icon: MessageSquare,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "FAQ & Forum Sistemi",
    desc: "Məhsullarınıza tez-tez verilən sualları əlavə edin — FAQPage JSON-LD ilə işarələnir. AI axtarışlarda sual-cavab formatında birbaşa görünür.",
    badge: "GEO üçün vacib",
  },
  {
    icon: BarChart3,
    color: "text-orange-600",
    bg: "bg-orange-50",
    title: "Analitika & Hesabatlar",
    desc: "Məhsullarınızın baxış sayı, forum aktivliyi və performans göstəriciləri real vaxtda izlənilir. Hansı məhsulun daha çox diqqət çəkdiyini görün.",
    badge: null,
  },
  {
    icon: Shield,
    color: "text-red-600",
    bg: "bg-red-50",
    title: "Təhlükəsiz & Etibarlı",
    desc: "Supabase infrastrukturu üzərində qurulub. Row Level Security ilə məlumatlarınız yalnız sizə məxsusdur. Frankfurt serverləri — GDPR uyğun.",
    badge: null,
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-indigo-50/50 to-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Zap className="h-3.5 w-3.5" />
            Platforma Xüsusiyyətləri
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6">
            Məhsullarınızı AI axtarışa
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> hazırlayın</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Encyclo yalnız ensiklopediya deyil — Azərbaycan şirkətlərinin məhsullarını AI axtarış sistemlərində görünən hala gətirən GEO platformasıdır.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow relative">
                {f.badge && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 text-[10px] font-bold bg-indigo-600 text-white rounded-full">
                    {f.badge}
                  </span>
                )}
                <div className={`h-12 w-12 ${f.bg} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Başlamağa hazırsınız?</h2>
          <p className="text-indigo-200 mb-8">Qeydiyyat pulsuzdur. İlk məhsulunuzu 5 dəqiqəyə əlavə edin.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
          >
            Pulsuz başla <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
