"use client";

import { useEffect, useState } from "react";
import { Sparkles, Brain, Loader2, CheckCircle2, AlertCircle, Save, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Product, ProductTranslation } from "@/types";

export default function AIContentPage() {
  const supabase = createClient();
  
  // State
  const [products, setProducts] = useState<(Product & { translations: ProductTranslation[] })[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [currentTranslation, setCurrentTranslation] = useState<ProductTranslation | null>(null);
  const [optimizedDescription, setOptimizedDescription] = useState<string>("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
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

        if (data) {
          setProducts(data as (Product & { translations: ProductTranslation[] })[]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Məhsulları yükləyərkən xəta baş verdi");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      const azTranslation = product.translations.find(t => t.locale === 'az');
      setCurrentTranslation(azTranslation || null);
      setOptimizedDescription(""); // Reset optimized version when product changes
    }
  };

  // Handle AI optimization
  const handleOptimize = async () => {
    if (!currentTranslation?.description) return;

    setIsOptimizing(true);
    try {
      const response = await fetch("/api/ai-optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: currentTranslation.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "AI sorğusu zamanı xəta baş verdi");
      }

      const { optimizedText } = await response.json();
      setOptimizedDescription(optimizedText);
      toast.success("Məzmun uğurla optimallaşdırıldı");
    } catch (error: any) {
      console.error("Optimization error:", error);
      toast.error(error.message || "AI ilə əlaqə zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle applying (saving) the optimized description
  const handleApply = async () => {
    if (!selectedProductId || !optimizedDescription) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('product_translations')
        .update({ description: optimizedDescription })
        .eq('product_id', selectedProductId)
        .eq('locale', 'az');

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p => {
        if (p.id === selectedProductId) {
          return {
            ...p,
            translations: p.translations.map(t => 
              t.locale === 'az' ? { ...t, description: optimizedDescription } : t
            )
          };
        }
        return p;
      }));
      
      setCurrentTranslation(prev => prev ? { ...prev, description: optimizedDescription } : null);
      
      toast.success("Dəyişikliklər uğurla yadda saxlanıldı");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Məlumatı yadda saxlayarkən xəta baş verdi");
    } finally {
      setIsSaving(false);
    }
  };

  const currentDescLength = currentTranslation?.description?.length || 0;
  const optimizedDescLength = optimizedDescription.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            AI Məzmun Optimallaşdırıcısı
          </h1>
          <p className="text-muted-foreground mt-1">Məhsul təsvirlərini GEO (Generative Engine Optimization) üçün hazırlayın</p>
        </div>
      </div>

      {/* Product Selection */}
      <Card className="rounded-2xl border-purple-100 bg-white shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-semibold text-gray-700">Məhsul seçin</label>
              <Select value={selectedProductId} onValueChange={handleProductSelect} disabled={isLoadingProducts}>
                <SelectTrigger className="h-11 rounded-xl border-gray-200">
                  <SelectValue placeholder={isLoadingProducts ? "Yüklənir..." : "Məhsul seçin"} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.translations.find(t => t.locale === 'az')?.name || product.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleOptimize} 
              disabled={!currentTranslation?.description || isOptimizing || isLoadingProducts}
              className="h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 font-semibold transition-all shadow-md shadow-purple-100 active:scale-[0.98]"
            >
              {isOptimizing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              AI ilə optimallaşdır
            </Button>
          </div>
          
          {!isLoadingProducts && products.length > 0 && !selectedProductId && (
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-400" />
              Optimallaşdırmaq istədiyiniz məhsulu siyahıdan seçin
            </p>
          )}

          {!isLoadingProducts && products.length === 0 && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">Hələ heç bir məhsulunuz yoxdur.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison View */}
      {selectedProductId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Current Version */}
          <Card className="rounded-2xl border-gray-100 shadow-sm flex flex-col h-full">
            <CardHeader className="pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Cari Azərbaycan təsviri</CardTitle>
              <span className={cn(
                "text-[11px] font-mono px-2 py-0.5 rounded-full",
                currentDescLength === 0 ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"
              )}>
                {currentDescLength} simvol
              </span>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <Textarea
                readOnly
                value={currentTranslation?.description || ""}
                placeholder="Bu məhsul üçün hələ təsvir əlavə edilməyib."
                className="flex-1 min-h-[400px] border-0 rounded-none focus-visible:ring-0 resize-none p-6 text-sm leading-relaxed text-gray-600 bg-gray-50/30"
              />
              {!currentTranslation?.description && (
                <div className="p-6 pt-0">
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-xs font-medium">Təsvir boşdur. AI optimallaşdırma üçün mətni olan məhsul seçin.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optimized Version */}
          <Card className="rounded-2xl border-purple-100 shadow-lg shadow-purple-50/50 flex flex-col h-full border-t-4 border-t-purple-500">
            <CardHeader className="pb-3 border-b border-purple-50 flex flex-row items-center justify-between bg-purple-50/30">
              <CardTitle className="text-sm font-bold text-purple-700 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                GEO-Optimallaşdırılmış versiya
              </CardTitle>
              <span className={cn(
                "text-[11px] font-mono px-2 py-0.5 rounded-full",
                optimizedDescLength > 0 ? "bg-purple-100 text-purple-600" : "bg-gray-50 text-gray-400"
              )}>
                {optimizedDescLength} simvol
              </span>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <Textarea
                value={optimizedDescription}
                onChange={(e) => setOptimizedDescription(e.target.value)}
                placeholder="AI tərəfindən yaradılan mətn burada görünəcək..."
                className="flex-1 min-h-[400px] border-0 rounded-none focus-visible:ring-0 resize-none p-6 text-sm leading-relaxed text-gray-800"
              />
              <div className="p-6 border-t border-purple-50 bg-purple-50/10 flex justify-end">
                <Button 
                  onClick={handleApply}
                  disabled={!optimizedDescription || isSaving || isOptimizing}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-8 font-bold transition-all active:scale-[0.95]"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Tətbiq et
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedProductId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
           <div className="p-6 bg-white rounded-2xl border border-gray-100 space-y-3">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm">Axtarış sistemləri üçün</p>
              <p className="text-xs text-gray-500 leading-relaxed">Mətniniz ChatGPT, Perplexity və Google AI kimi sistemlərdə daha yaxşı tapılması üçün xüsusi strukturla yenidən yazılır.</p>
           </div>
           <div className="p-6 bg-white rounded-2xl border border-gray-100 space-y-3">
              <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm">Faktlara əsaslanan</p>
              <p className="text-xs text-gray-500 leading-relaxed">AI mövcud mətndəki faktları, rəqəmləri və vacib xüsusiyyətləri önə çıxarır.</p>
           </div>
           <div className="p-6 bg-white rounded-2xl border border-gray-100 space-y-3">
              <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-amber-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm">Ağıllı struktur</p>
              <p className="text-xs text-gray-500 leading-relaxed">Sual-cavab formatı və aydın bölmələr həm botlar, həm də insanlar üçün oxunurluğu artırır.</p>
           </div>
        </div>
      )}
    </div>
  );
}
