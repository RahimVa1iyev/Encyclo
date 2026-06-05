import { getSession } from "next-auth/react";
// app/(dashboard)/dashboard/products/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  ExternalLink, 
  Trash2, 
  Pause, 
  Play, 
  Package 
} from "lucide-react";
import type { Product, ProductTranslation } from "@/types";
import { Link } from '@/lib/navigation';
import { format } from "date-fns";
import { az } from "date-fns/locale";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const filters = [
  { id: "all", label: "Hamısı" },
  { id: "active", label: "Aktiv" },
  { id: "draft", label: "Qaralama" },
] as const;

// StatusBadge inline component
function StatusBadge({ variant, children }: { variant: "active" | "draft"; children: React.ReactNode }) {
  const palette = {
    active: { bg: "oklch(0.94 0.06 150)", fg: "oklch(0.4 0.14 150)", dot: "oklch(0.55 0.16 150)" },
    draft: { bg: "oklch(0.95 0.005 250)", fg: "oklch(0.45 0.02 257)", dot: "oklch(0.6 0.02 257)" },
  }[variant];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold select-none"
      style={{ backgroundColor: palette.bg, color: palette.fg }}>
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

// PrimaryButton inline component
function PrimaryButton({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.97] ${className}`}
      style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
      {children}
    </button>
  );
}

export default function MyProductsPage() {
  const [products, setProducts] = useState<(Product & { translations: ProductTranslation[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const filteredProducts = products.filter((p: any) => {
    const name = p.translations?.[0]?.name || p.slug;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { getProductsData } = await import('../../actions');
      const data = await getProductsData();
      if (data) setProducts(data as any[]);
    } catch (error) {
      toast.error("Məlumatları yükləyərkən xəta baş verdi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchProducts(); 
  }, []);

  const updateStatus = async (productId: string, newStatus: "draft" | "active") => {
    try {
      const { updateProductStatus } = await import('../../actions');
      await updateProductStatus(productId, newStatus);
      setProducts(prev => prev.map((p: any) => p.id === productId ? { ...p, status: newStatus } : p));
      toast.success(newStatus === "active" ? "Məhsul aktiv edildi" : "Məhsul qaralamaya alındı");
    } catch { 
      toast.error("Statusu yeniləyərkən xəta baş verdi"); 
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { deleteProductAction } = await import('../../actions');
      await deleteProductAction(productId);
      setProducts(prev => prev.filter((p: any) => p.id !== productId));
      toast.success("Məhsul silindi");
    } catch { 
      toast.error("Məhsulu silərkən xəta baş verdi"); 
    } finally { 
      setDeleteId(null); 
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded-xl" />
            <div className="h-4 w-64 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-xl" />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-10 flex-1 md:max-w-md bg-gray-200 rounded-xl" />
          <div className="h-10 w-48 bg-gray-200 rounded-xl" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-2xl border bg-surface overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="h-10 bg-gray-200" />
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {Array.from({ length: 5 }).map((_: any, i: any) => (
              <div key={i} className="flex items-center justify-between p-4 px-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-12 bg-gray-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Məhsullarım
            <span className="rounded-full px-2 py-0.5 text-xs font-bold"
              style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
              {products.length}
            </span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Bütün məhsullarınızı buradan idarə edin</p>
        </div>
        <Link href="/dashboard/add-content">
          <PrimaryButton><Plus size={16} />Yeni məhsul əlavə et</PrimaryButton>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border bg-surface px-3 md:max-w-md"
          style={{ borderColor: "var(--border)" }}>
          <Search size={15} className="text-muted-foreground" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Məhsul adı ilə axtar..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-[var(--foreground)]" 
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border bg-surface p-1" style={{ borderColor: "var(--border)" }}>
          {filters.map((f: any) => (
            <button 
              key={f.id} 
              onClick={() => setStatusFilter(f.id)}
              className="rounded-[12px] px-3 py-1.5 text-xs font-semibold transition-all"
              style={statusFilter === f.id
                ? { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }
                : { color: "var(--muted-foreground)" }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Card Table */}
      <Card className="p-0 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="m-5 rounded-2xl border-2 border-dashed p-12 text-center" style={{ borderColor: "var(--border)" }}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
              <Package size={20} />
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">Heç bir məhsul tapılmadı</h3>
            <p className="mt-1 text-xs text-muted-foreground">Axtarış filtrlərini dəyişdirin və ya yeni məhsul əlavə edin</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ backgroundColor: "var(--muted)", borderColor: "var(--border)" }}>
                  {["Məhsul", "Növ", "Status", "Tarix", "Baxış", "Əməliyyat"].map((h: any) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p: any, i: any) => {
                  const translation = p.translations?.[0];
                  const name = translation?.name || p.slug;
                  const thumbnail = p.images?.[0];
                  const initials = name.split(" ").slice(0, 2).map((w: any) => w[0]).join("").toUpperCase();
                  const displayId = p.id.split("-")[0].toUpperCase();
                  const formattedDate = format(new Date(p.created_at), "d MMM yyyy", { locale: az });

                  return (
                    <tr key={p.id}
                      className={`transition-colors hover:bg-[var(--muted)] ${i !== filteredProducts.length - 1 ? "border-b" : ""}`}
                      style={{ borderColor: "var(--border)" }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold overflow-hidden"
                            style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
                            {thumbnail ? (
                              <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-[var(--foreground)]">{name}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">{displayId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium text-[var(--foreground)]" style={{ borderColor: "var(--border)" }}>
                          {p.type === "service" ? "Xidmət" : "Məhsul"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge variant={p.status === "active" ? "active" : "draft"}>
                          {p.status === "active" ? "Aktiv" : "Qaralama"}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{formattedDate}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye size={12} className="text-muted-foreground" />
                          <span>{p.views || 0}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-0.5">
                          {/* Edit button */}
                          <Link href={`/dashboard/products/${p.id}/edit`}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[var(--background)] hover:text-foreground"
                            title="Redaktə et">
                            <Pencil size={14} />
                          </Link>

                          {/* Public view button */}
                          {p.status === "active" ? (
                            <Link href={`/products/${p.slug}`} target="_blank"
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[var(--background)] hover:text-foreground"
                              title="Bax">
                              <ExternalLink size={14} />
                            </Link>
                          ) : (
                            <button disabled
                              className="rounded-md p-1.5 text-muted-foreground/40 cursor-not-allowed"
                              title="Bax (Yalnız aktiv məhsullar)">
                              <ExternalLink size={14} />
                            </button>
                          )}

                          {/* Status toggle (play/pause) */}
                          <button onClick={() => updateStatus(p.id, p.status === "active" ? "draft" : "active")}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[var(--background)] hover:text-foreground"
                            title={p.status === "active" ? "Qaralamaya al" : "Aktiv et"}>
                            {p.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                          </button>

                          {/* Delete confirmation trigger */}
                          <button onClick={() => setDeleteId(p.id)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[var(--background)] hover:text-foreground hover:text-red-500"
                            title="Sil">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Məhsulu silmək istəyirsiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu əməliyyat geri alına bilməz. Məhsul və bütün tərcümələri həmişəlik silinəcək.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Ləğv et</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteProduct(deleteId)}
              className="bg-red-600 hover:bg-red-500 rounded-xl"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
