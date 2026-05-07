"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Package, 
  Plus, 
  ExternalLink, 
  Play, 
  Pause, 
  Trash2, 
  Loader2,
  Pencil,
  Search,
  Eye
} from "lucide-react";
import type { Product, ProductTranslation } from "@/types";
import Link from "next/link";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

export default function MyProductsPage() {
  const [products, setProducts] = useState<(Product & { translations: ProductTranslation[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "suspended">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const supabase = createClient();

  const filteredProducts = products.filter((p) => {
    const name = p.translations?.[0]?.name || p.slug;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (!company) return;

        const { data } = await supabase
          .from('products')
          .select('*, translations:product_translations(*)')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false });

        if (data) setProducts(data as (Product & { translations: ProductTranslation[] })[]);
      } catch (error) {
        console.error(error);
        toast.error("Məlumatları yükləyərkən xəta baş verdi");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const updateStatus = async (productId: string, newStatus: "draft" | "active" | "suspended") => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev =>
        prev.map(p => p.id === productId ? { ...p, status: newStatus } : p)
      );
      
      toast.success(
        newStatus === 'active' ? "Məhsul aktiv edildi" : "Məhsul dayandırıldı"
      );
    } catch (error) {
      toast.error("Statusu yeniləyərkən xəta baş verdi");
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error: transError } = await supabase
        .from('product_translations')
        .delete()
        .eq('product_id', productId);

      if (transError) throw transError;

      const { error: prodError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (prodError) throw prodError;

      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success("Məhsul silindi");
    } catch (error) {
      toast.error("Məhsulu silərkən xəta baş verdi");
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Aktiv</Badge>;
      case 'suspended':
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Dayandırılıb</Badge>;
      case 'draft':
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">Qaralama</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded-xl" />
            <div className="h-4 w-64 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-11 w-44 bg-gray-200 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b bg-gray-50/50 grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded-lg" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-50 grid grid-cols-5 gap-4 items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex-shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded-lg" />
                  <div className="h-3 w-20 bg-gray-100 rounded-lg" />
                </div>
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded-lg" />
              <div className="h-6 w-16 bg-gray-100 rounded-lg mx-auto" />
              <div className="h-4 w-24 bg-gray-100 rounded-lg" />
              <div className="flex justify-end gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-10 w-10 bg-gray-100 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Məhsullarım</h1>
          <p className="text-muted-foreground mt-1">Əlavə etdiyiniz məhsul və xidmətlər</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-6 h-11">
          <Link href="/dashboard/add-content">
            <Plus className="mr-2 h-4 w-4" /> Yeni məhsul əlavə et
          </Link>
        </Button>
      </div>

      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Məhsul axtar..."
              className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "draft", "suspended"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all",
                  statusFilter === s
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                )}
              >
                {s === "all" ? "Hamısı" : s === "active" ? "Aktiv" : s === "draft" ? "Qaralama" : "Dayandırılıb"}
              </button>
            ))}
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <Card className="border-dashed border-2 py-20 rounded-3xl bg-gray-50/30">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Package className="h-10 w-10 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-2xl text-gray-900">Hələ məhsul əlavə etməmisiniz</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Məhsul və ya xidmətlərinizi əlavə edərək ensiklopediyada görünməsini təmin edin.</p>
            </div>
            <Button asChild variant="outline" className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-8">
              <Link href="/dashboard/add-content">
                İlk məhsulunuzu əlavə edin →
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Məhsul</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Növ</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Tarix</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                    Baxışlar
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => {
                  const translation = product.translations?.[0];
                  const name = translation?.name || product.slug;
                  const thumbnail = product.images?.[0];

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                            {thumbnail ? (
                              <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block group-hover:text-indigo-600 transition-colors">{name}</span>
                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">ID: {product.id.split('-')[0]}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize border-slate-200 text-slate-500 font-medium">
                          {product.type === 'service' ? 'Xidmət' : 'Məhsul'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap font-medium">
                        {format(new Date(product.created_at), "d MMMM yyyy", { locale: az })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700">
                          <Eye className="h-3.5 w-3.5 text-gray-400" />
                          {(product as any).views || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" title="Redaktə et">
                            <Link href={`/dashboard/products/${product.id}/edit`}>
                              <Pencil className="h-4.5 w-4.5" />
                            </Link>
                          </Button>

                          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" title="Bax">
                            <Link href={`/encyclopedia/products/${product.slug}`} target="_blank">
                              <ExternalLink className="h-4.5 w-4.5" />
                            </Link>
                          </Button>
                          
                          {(product.status === 'draft' || product.status === 'suspended') && (
                            <Button 
                              onClick={() => updateStatus(product.id, 'active')}
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl text-green-500 hover:text-green-600 hover:bg-green-50"
                              title="Aktiv et"
                            >
                              <Play className="h-4.5 w-4.5 fill-current" />
                            </Button>
                          )}

                          {product.status === 'active' && (
                            <Button 
                              onClick={() => updateStatus(product.id, 'suspended')}
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                              title="Dayandır"
                            >
                              <Pause className="h-4.5 w-4.5 fill-current" />
                            </Button>
                          )}

                          <Button 
                            onClick={() => setDeleteId(product.id)}
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Sil"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && products.length > 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                      Axtarışa uyğun məhsul tapılmadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
