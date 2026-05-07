"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Product, ProductTranslation } from "@/types";

type FAQ = {
  id: string;
  question: string;
  content: string;
  created_at: string;
};

type ProductWithFAQs = Product & {
  translations: ProductTranslation[];
  faqs: FAQ[];
};

export default function ForumDashboardPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<ProductWithFAQs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [addingFAQFor, setAddingFAQFor] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!company) {
        setIsLoading(false);
        return;
      }

      const { data: productsData } = await supabase
        .from("products")
        .select("*, translations:product_translations(*)")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (!productsData) {
        setIsLoading(false);
        return;
      }

      // Fetch FAQs for all products
      const productIds = productsData.map((p) => p.id);
      const { data: faqData } = await supabase
        .from("forum_posts")
        .select("id, question, content, created_at, product_id")
        .in("product_id", productIds)
        .eq("is_faq", true)
        .order("created_at", { ascending: false });

      const productsWithFAQs = productsData.map((p) => ({
        ...p,
        faqs: (faqData || []).filter((f) => f.product_id === p.id),
      }));

      setProducts(productsWithFAQs as ProductWithFAQs[]);
      setIsLoading(false);
    }
    init();
  }, []);

  const handleAddFAQ = async (productId: string) => {
    if (!question.trim() || !answer.trim()) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("İstifadəçi tapılmadı");

      const { data, error } = await supabase
        .from("forum_posts")
        .insert({
          product_id: productId,
          user_id: user.id,
          content: answer.trim(),
          question: question.trim(),
          is_faq: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, faqs: [{ id: data.id, question: data.question, content: data.content, created_at: data.created_at }, ...p.faqs] }
            : p
        )
      );

      setQuestion("");
      setAnswer("");
      setAddingFAQFor(null);
      toast.success("FAQ əlavə edildi");
    } catch (err: any) {
      toast.error(err.message || "Xəta baş verdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFAQ = async (faqId: string, productId: string) => {
    try {
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", faqId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, faqs: p.faqs.filter((f) => f.id !== faqId) }
            : p
        )
      );

      toast.success("FAQ silindi");
    } catch (err: any) {
      toast.error(err.message || "Xəta baş verdi");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-gray-200 rounded-xl" />
          <div className="h-4 w-64 bg-gray-100 rounded-xl" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 bg-gray-200 rounded-lg" />
              <div className="h-8 w-24 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-4 w-full bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Forum & FAQ</h1>
        <p className="text-muted-foreground mt-1">
          Məhsullarınıza tez-tez verilən sualları əlavə edin — AI axtarışda görünsün
        </p>
      </div>

      {/* Info card */}
      <Card className="rounded-2xl border-indigo-100 bg-indigo-50/50 shadow-none">
        <CardContent className="p-4 flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-700 leading-relaxed">
            FAQ-lar məhsul səhifəsində göstərilir və <strong>FAQPage JSON-LD</strong> ilə işarələnir.
            ChatGPT, Perplexity kimi AI axtarışlarda sual-cavab formatında birbaşa görünür.
          </p>
        </CardContent>
      </Card>

      {/* Empty state */}
      {products.length === 0 && (
        <Card className="rounded-2xl border-dashed border-2 border-gray-200 shadow-none">
          <CardContent className="py-16 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-gray-300" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-gray-900">Hələ məhsul əlavə etməmisiniz</p>
              <p className="text-sm text-gray-500">FAQ əlavə etmək üçün əvvəlcə məhsul yaradın</p>
            </div>
            <a
              href="/dashboard/add-content"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
            >
              <Plus className="h-4 w-4" />
              Məhsul əlavə et
            </a>
          </CardContent>
        </Card>
      )}

      {/* Products with FAQs */}
      {products.map((product) => {
        const name = product.translations?.[0]?.name || product.slug;
        const isExpanded = expandedProduct === product.id;
        const isAddingFAQ = addingFAQFor === product.id;

        return (
          <Card key={product.id} className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
            {/* Product header */}
            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
              onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} className="w-full h-full object-cover" alt={name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📦</div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      className={cn(
                        "text-[10px] border-none",
                        product.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {product.status === "active" ? "Aktiv" : "Qaralama"}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {product.faqs.length} FAQ
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddingFAQFor(isAddingFAQ ? null : product.id);
                    setExpandedProduct(product.id);
                    setQuestion("");
                    setAnswer("");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  FAQ əlavə et
                </button>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                {/* Add FAQ form */}
                {isAddingFAQ && (
                  <div className="p-5 bg-indigo-50/30 border-b border-indigo-100/50 space-y-4">
                    <p className="text-sm font-semibold text-gray-700">Yeni FAQ</p>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Sual</Label>
                      <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="məs: Bu məhsulun qiyməti nədir?"
                        className="h-10 text-sm rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Cavab</Label>
                      <Textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Sualın ətraflı cavabını yazın..."
                        rows={3}
                        className="text-sm rounded-xl resize-none"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => {
                          setAddingFAQFor(null);
                          setQuestion("");
                          setAnswer("");
                        }}
                      >
                        Ləğv et
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!question.trim() || !answer.trim() || isSubmitting}
                        onClick={() => handleAddFAQ(product.id)}
                        className="bg-indigo-600 hover:bg-indigo-500 rounded-xl"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Əlavə edilir...</>
                        ) : (
                          "Əlavə et"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* FAQ list */}
                {product.faqs.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-400">
                    Bu məhsul üçün hələ FAQ yoxdur
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {product.faqs.map((faq) => (
                      <div key={faq.id} className="p-5 flex gap-4 items-start group">
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            Q: {faq.question}
                          </p>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            A: {faq.content}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteId(faq.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Delete dialog — outside map iteration context */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>FAQ-ı silmək istəyirsiniz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu əməliyyat geri alına bilməz. FAQ məhsul səhifəsindən silinəcək.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Ləğv et</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (deleteId) handleDeleteFAQ(deleteId, product.id);
                    }}
                    className="bg-red-600 hover:bg-red-500 rounded-xl"
                  >
                    Sil
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        );
      })}
    </div>
  );
}
