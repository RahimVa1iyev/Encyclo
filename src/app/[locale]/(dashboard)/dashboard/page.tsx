import { getSession } from "next-auth/react";
// app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Package, 
  CheckCircle2, 
  FileText, 
  Eye, 
  ArrowUpRight, 
  TrendingUp 
} from "lucide-react";
import { Link } from '@/lib/navigation';
import { formatDistanceToNow } from "date-fns";
import { az } from "date-fns/locale";
import type { ProductTranslation } from "@/types";
import { calculateGeoScore, calculateCompanyGeoScore, getGeoScoreColor } from '@/lib/geo-score';

type RecentProduct = {
  id: string; 
  status: string; 
  created_at: string; 
  slug: string;
  images: string[] | null; 
  views: number | null; 
  translations: ProductTranslation[];
};

// StatCard inline component
function StatCard({ label, value, icon: Icon, trend, accent }: {
  label: string; 
  value: string | number; 
  icon: any; 
  trend?: string; 
  accent?: "default" | "green" | "amber" | "violet";
}) {
  const palette = {
    default: { bg: "var(--badge-bg)", fg: "var(--badge-fg)" },
    green: { bg: "oklch(0.94 0.06 150)", fg: "oklch(0.42 0.14 150)" },
    amber: { bg: "oklch(0.95 0.07 80)", fg: "oklch(0.5 0.15 60)" },
    violet: { bg: "oklch(0.94 0.05 290)", fg: "oklch(0.45 0.2 290)" },
  }[accent ?? "default"];
  return (
    <div className="rounded-2xl border bg-surface p-5" style={{ borderColor: "var(--border)" }}>
      <div className="mb-4 flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: palette.bg, color: palette.fg }}>
          <Icon size={16} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black tracking-tight" style={{ color: "var(--accent)" }}>{value}</p>
        {trend ? <span className="text-xs font-semibold" style={{ color: "oklch(0.55 0.14 150)" }}>{trend}</span> : null}
      </div>
    </div>
  );
}

// StatusBadge inline component
function StatusBadge({ variant, children }: { variant: "active" | "draft"; children: React.ReactNode }) {
  const palette = {
    active: { bg: "oklch(0.94 0.06 150)", fg: "oklch(0.4 0.14 150)", dot: "oklch(0.55 0.16 150)" },
    draft: { bg: "oklch(0.95 0.005 250)", fg: "oklch(0.45 0.02 257)", dot: "oklch(0.6 0.02 257)" },
  }[variant];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold select-none" style={{ backgroundColor: palette.bg, color: palette.fg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.dot }} />
      {children}
    </span>
  );
}

// Card inline component
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-surface p-5 ${className}`} style={{ borderColor: "var(--border)" }}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0, draftProducts: 0, totalViews: 0 });
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyGeoScore, setCompanyGeoScore] = useState(0);
  const [productScores, setProductScores] = useState<any[]>([]);
  useEffect(() => {
    async function fetchData() {
      const { getDashboardPageData } = await import('../actions');
      const data = await getDashboardPageData();
      if (!data || !data.company) {
        setIsLoading(false);
        return;
      }
      
      const { allProducts, faqs } = data;
      
      if (allProducts) {
        const faqCounts: Record<string, number> = {};
        
        faqs?.forEach((f: any) => {
          const pid = String(f.product_id);
          faqCounts[pid] = (faqCounts[pid] || 0) + 1;
        });

        const productsForScoring = allProducts.map((p: any) => ({
          ...p,
          faqCount: faqCounts[p.id] || 0,
        }));

        setCompanyGeoScore(calculateCompanyGeoScore(productsForScoring));
        setProductScores(productsForScoring.map((p: any) => ({
          product: p,
          score: calculateGeoScore(p),
        })));

        setStats({
          totalProducts: allProducts.length,
          activeProducts: allProducts.filter((p: any) => p.status === "active").length,
          draftProducts: allProducts.filter((p: any) => p.status === "draft").length,
          totalViews: allProducts.reduce((sum: number, p: any) => sum + (p.views || 0), 0),
        });
        
        // Note: Make sure dates are properly typed since they come from server action as objects usually, 
        // but here they will be stringified if we are passing them, wait, server actions return Date as Date.
        setRecentProducts(allProducts.slice(0, 5) as any[]);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded-xl" />
          <div className="h-4 w-64 bg-gray-100 rounded-xl" />
        </div>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_: any, i: any) => (
            <div key={i} className="rounded-2xl border bg-surface p-5 space-y-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-surface overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between items-center border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
                <div className="space-y-1">
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-40 bg-gray-100 rounded" />
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
              <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                {Array.from({ length: 5 }).map((_: any, i: any) => (
                  <li key={i} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-40 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </div>
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border bg-surface p-5 space-y-4" style={{ borderColor: "var(--border)" }}>
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 w-full bg-gray-100 rounded-full" />
            </div>
            <div className="rounded-2xl border bg-surface p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
              <div className="h-4 w-28 bg-gray-200 rounded" />
              {Array.from({ length: 3 }).map((_: any, i: any) => (
                <div key={i} className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Xoş gəldiniz 👋</h2>
        <p className="mt-1 text-sm text-muted-foreground">Bugünkü vəziyyət və son aktivlik</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard 
          label="Ümumi Məhsullar" 
          value={stats.totalProducts} 
          icon={Package} 
        />
        <StatCard 
          label="Aktiv Məhsullar" 
          value={stats.activeProducts} 
          icon={CheckCircle2} 
          accent="green" 
        />
        <StatCard 
          label="Qaralamalar" 
          value={stats.draftProducts} 
          icon={FileText} 
          accent="amber" 
        />
        <StatCard 
          label="Baxışlar (30g)" 
          value={stats.totalViews} 
          icon={Eye} 
          accent="violet" 
          trend="+22%" 
        />
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Products Card */}
        <div className="lg:col-span-2">
          <Card className="p-0">
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
              <div>
                <h3 className="text-[13px] font-bold text-[var(--foreground)]">Son məhsullar</h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Ən son əlavə edilən və yenilənmiş</p>
              </div>
              <Link href="/dashboard/products" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--accent)" }}>
                Hamısına bax <ArrowUpRight size={13} />
              </Link>
            </div>
            <ul>
              {recentProducts.length === 0 ? (
                <li className="px-5 py-6 text-center text-xs text-muted-foreground">
                  Hələ məhsul əlavə edilməyib.
                </li>
              ) : (
                recentProducts.map((p: any, i: any) => {
                  const name = p.translations?.[0]?.name || p.slug;
                  const formattedDate = formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: az });
                  const initials = name.split(" ").slice(0, 2).map((w: any) => w[0]).join("").toUpperCase();

                  return (
                    <li 
                      key={p.id} 
                      className={`flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[var(--muted)] ${i !== recentProducts.length - 1 ? "border-b" : ""}`} 
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div 
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold" 
                        style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-[var(--foreground)]">{name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          ID: {p.id.split('-')[0]} · {formattedDate}
                        </div>
                      </div>
                      <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                        <Eye size={12} />
                        <span>{p.views || 0}</span>
                      </div>
                      <StatusBadge variant={p.status === "active" ? "active" : "draft"}>
                        {p.status === "active" ? "Aktiv" : "Qaralama"}
                      </StatusBadge>
                    </li>
                  );
                })
              )}
            </ul>
          </Card>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-4">
          {/* GEO Score Widget */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                GEO Hazırlıq Skoru
              </h3>
              <span 
                className="text-3xl font-black"
                style={{ color: getGeoScoreColor(companyGeoScore >= 80 ? 'excellent' : companyGeoScore >= 60 ? 'good' : companyGeoScore >= 35 ? 'medium' : 'low') }}
              >
                {companyGeoScore}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${companyGeoScore}%`,
                  backgroundColor: getGeoScoreColor(companyGeoScore >= 80 ? 'excellent' : companyGeoScore >= 60 ? 'good' : companyGeoScore >= 35 ? 'medium' : 'low')
                }}
              />
            </div>

            {/* Ən aşağı score-lu məhsulun breakdown-u */}
            {productScores.length > 0 && (() => {
              const worst = [...productScores].sort((a: any, b: any) => a.score.percentage - b.score.percentage)[0];
              const worstName = worst.product.translations?.find((t: any) => t.locale === 'az')?.name || 'Məhsul';
              return (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Ən çox diqqət tələb edən: <span className="font-semibold text-foreground">{worstName}</span>
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(worst.score.breakdown).map(([key, item]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className={item.passed ? 'text-muted-foreground' : 'text-foreground font-medium'}>
                          {item.passed ? '✓' : '○'} {item.detail}
                        </span>
                        <span className={item.passed ? 'text-green-500' : 'text-muted-foreground'}>
                          {item.score}/{item.max}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Quick Actions Widget */}
          <Card>
            <h3 className="text-[13px] font-bold text-[var(--foreground)]">Tez əməliyyatlar</h3>
            <div className="mt-3 space-y-1.5">
              {[
                { href: "/dashboard/add-content", label: "Yeni məhsul əlavə et" },
                { href: "/dashboard/forum", label: "FAQ yenilə" },
                { href: "/dashboard/leads", label: "Müraciətlərə bax" },
              ].map((a: any) => (
                <Link 
                  key={a.href} 
                  href={a.href} 
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:bg-[var(--muted)] text-[var(--foreground)]" 
                  style={{ borderColor: "var(--border)" }}
                >
                  {a.label}<ArrowUpRight size={13} />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
