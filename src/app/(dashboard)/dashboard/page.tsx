// app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Package, 
  CheckCircle2, 
  FileText, 
  Eye, 
  ArrowUpRight, 
  TrendingUp 
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { az } from "date-fns/locale";
import type { ProductTranslation } from "@/types";

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
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .single();
        
      if (!company) { 
        setIsLoading(false); 
        return; 
      }
      
      const { data: allProducts } = await supabase
        .from("products")
        .select("id, status, created_at, slug, images, views, translations:product_translations(*)")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });
        
      if (allProducts) {
        setStats({
          totalProducts: allProducts.length,
          activeProducts: allProducts.filter((p) => p.status === "active").length,
          draftProducts: allProducts.filter((p) => p.status === "draft").length,
          totalViews: allProducts.reduce((sum, p) => sum + (p.views || 0), 0),
        });
        setRecentProducts(allProducts.slice(0, 5) as RecentProduct[]);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [supabase]);

  const geoScore = stats.totalProducts === 0 ? 0 : Math.round((stats.activeProducts / stats.totalProducts) * 100);

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
          {Array.from({ length: 4 }).map((_, i) => (
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
                {Array.from({ length: 5 }).map((_, i) => (
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
              {Array.from({ length: 3 }).map((_, i) => (
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
                recentProducts.map((p, i) => {
                  const name = p.translations?.[0]?.name || p.slug;
                  const formattedDate = formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: az });
                  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

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
          <Card>
            <div className="flex items-center gap-2">
              <TrendingUp size={15} style={{ color: "var(--accent)" }} />
              <h3 className="text-[13px] font-bold text-[var(--foreground)]">GEO görünmə skoru</h3>
            </div>
            <div className="mt-4 text-4xl font-black" style={{ color: "var(--accent)" }}>
              {geoScore}<span className="text-xl text-muted-foreground">/100</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--muted)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${geoScore}%`, backgroundColor: "var(--accent)" }} />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Məhsullarınızın {geoScore}%-i AI axtarış mühərriklərində optimallaşdırılıb.
            </p>
          </Card>

          {/* Quick Actions Widget */}
          <Card>
            <h3 className="text-[13px] font-bold text-[var(--foreground)]">Tez əməliyyatlar</h3>
            <div className="mt-3 space-y-1.5">
              {[
                { href: "/dashboard/add-content", label: "Yeni məhsul əlavə et" },
                { href: "/dashboard/forum", label: "FAQ yenilə" },
                { href: "/dashboard/leads", label: "Müraciətlərə bax" },
              ].map((a) => (
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
