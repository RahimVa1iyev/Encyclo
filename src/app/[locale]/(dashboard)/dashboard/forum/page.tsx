import { getSession } from "next-auth/react";
// app/(dashboard)/dashboard/forum/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  Brain,
  Check,
  X,
  Pencil,
} from "lucide-react";
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

const inputClass = "h-10 w-full rounded-xl border px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]";
const inputStyle: React.CSSProperties = { borderColor: "var(--border)", backgroundColor: "var(--surface)" };

// Card component inline
function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div 
      className={`rounded-2xl border ${className}`}
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", ...style }}
    >
      {children}
    </div>
  );
}

// Field component inline
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--foreground)]">{label}</span>
        {hint ? <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

// PrimaryButton component inline
function PrimaryButton({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
      {children}
    </button>
  );
}

// SecondaryButton component inline
function SecondaryButton({ children, className = "", style, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [hovered, setHovered] = useState(false);
  return (
    <button {...rest}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-transparent px-4 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ 
        borderColor: "var(--border)", 
        color: "var(--foreground)",
        backgroundColor: hovered ? "var(--muted)" : "transparent",
        ...style
      }}
    >
      {children}
    </button>
  );
}

// SmallSecondaryButton component inline
function SmallSecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: (e: any) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
      style={{ 
        border: "1px solid var(--border)", 
        color: "var(--foreground)",
        backgroundColor: hovered ? "var(--muted)" : "transparent"
      }}
    >
      {children}
    </button>
  );
}

// IconButton component inline
function IconButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-md p-1.5 cursor-pointer transition-colors"
      style={{
        color: hovered ? "var(--foreground)" : "var(--muted-foreground)",
        backgroundColor: hovered ? "var(--muted)" : "transparent",
        border: "none",
      }}
    >
      {children}
    </button>
  );
}

// CloseButton component inline
function CloseButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-lg p-1.5 cursor-pointer transition-colors"
      style={{
        color: hovered ? "var(--foreground)" : "var(--muted-foreground)",
        backgroundColor: hovered ? "var(--muted)" : "transparent",
        border: "none",
      }}
    >
      <X size={18} />
    </button>
  );
}

// ProductHeaderRow component inline
function ProductHeaderRow({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex items-center justify-between p-5 cursor-pointer transition-colors"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "color-mix(in oklab, var(--muted) 40%, transparent)" : "transparent"
      }}
    >
      {children}
    </div>
  );
}

// StatusBadge component inline
function StatusBadge({ variant, children }: { variant: "active" | "draft" | "warning" | "new"; children: React.ReactNode }) {
  const palette = {
    active: { bg: "oklch(0.94 0.06 150)", fg: "oklch(0.4 0.14 150)", dot: "oklch(0.55 0.16 150)" },
    draft: { bg: "oklch(0.95 0.005 250)", fg: "oklch(0.45 0.02 257)", dot: "oklch(0.6 0.02 257)" },
    warning: { bg: "oklch(0.95 0.07 80)", fg: "oklch(0.45 0.15 60)", dot: "oklch(0.65 0.16 70)" },
    new: { bg: "var(--badge-bg)", fg: "var(--badge-fg)", dot: "var(--accent)" },
  }[variant];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold select-none"
      style={{ backgroundColor: palette.bg, color: palette.fg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.dot }} />
      {children}
    </span>
  );
}

export default function ForumDashboardPage() {
  const [products, setProducts] = useState<ProductWithFAQs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [addingFAQFor, setAddingFAQFor] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{faqId: string; productId: string} | null>(null);

  // AI FAQ State
  const [aiFAQs, setAiFAQs] = useState<{ question: string; answer: string; selected: boolean }[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  // Questionnaire panel state
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireProductId, setQuestionnaireProductId] = useState<string | null>(null);

  // Questionnaire form fields
  const [topQuestions, setTopQuestions] = useState('');
  const [mainDifference, setMainDifference] = useState('');
  const [supportInfo, setSupportInfo] = useState('');

  // Intent choices
  const [selectedIntents, setSelectedIntents] = useState<string[]>([
    'what_is', 'pricing', 'how_to', 'comparison', 'trust'
  ]);

  // FAQ Inline Edit State
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const intents = [
    { id: "what_is", label: "Nədir / Nə edir", icon: "🔍" },
    { id: "pricing", label: "Qiymət / Tariflər", icon: "💰" },
    { id: "how_to", label: "Necə başlamaq", icon: "🚀" },
    { id: "comparison", label: "Rəqiblərdən fərqi", icon: "⚖️" },
    { id: "trust", label: "Zəmanət / Dəstək", icon: "🛡️" },
  ];

  useEffect(() => {
    async function init() {
      const { getForumData } = await import('../../actions');
      const data = await getForumData();
      if (!data) {
        setIsLoading(false);
        return;
      }

      const { productsData, faqData } = data;

      const productsWithFAQs = productsData.map((p: any) => ({
        ...p,
        faqs: (faqData || []).filter((f: any) => f.product_id === p.id),
      }));

      setProducts(productsWithFAQs as unknown as ProductWithFAQs[]);
      setIsLoading(false);
    }
    init();
  }, []);

  const handleAddFAQ = async (productId: string) => {
    if (!question.trim() || !answer.trim()) return;
    if (!question.trim().endsWith('?')) {
      toast.warning("Sual sona '?' işarəsi ilə bitməlidir");
      return;
    }
    setIsSubmitting(true);

    try {
      const { addFAQAction } = await import('../../actions');
      const data = await addFAQAction(productId, question.trim(), answer.trim());

      // Update local state
      setProducts((prev) =>
        prev.map((p: any) =>
          p.id === productId
            ? { ...p, faqs: [{ id: data.id, question: data.question, content: data.content, created_at: data.created_at }, ...p.faqs] }
            : p
        ) as unknown as ProductWithFAQs[]
      );

      setQuestion("");
      setAnswer("");
      setAddingFAQFor(null);
      
      const savedProduct = products.find((p: any) => p.id === productId);
      toast.success("FAQ əlavə edildi", {
        action: savedProduct?.slug ? {
          label: "Məhsulda bax",
          onClick: () => window.open(`/products/${savedProduct.slug}`, '_blank')
        } : undefined
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xəta baş verdi";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFAQ = async (faqId: string, productId: string) => {
    try {
      const { deleteFAQAction } = await import('../../actions');
      await deleteFAQAction(faqId);

      setProducts((prev) =>
        prev.map((p: any) =>
          p.id === productId
            ? { ...p, faqs: p.faqs.filter((f: any) => f.id !== faqId) }
            : p
        ) as unknown as ProductWithFAQs[]
      );

      toast.success("FAQ silindi");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xəta baş verdi";
      toast.error(message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEditFAQ = async (faqId: string, productId: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    if (!editQuestion.trim().endsWith('?')) {
      toast.warning("Sual sona '?' işarəsi ilə bitməlidir");
      return;
    }
    setIsEditing(true);

    try {
      const { editFAQAction } = await import('../../actions');
      await editFAQAction(faqId, editQuestion.trim(), editAnswer.trim());

      setProducts((prev) =>
        prev.map((p: any) =>
          p.id === productId
            ? {
                ...p,
                faqs: p.faqs.map((f: any) =>
                  f.id === faqId
                    ? { ...f, question: editQuestion.trim(), content: editAnswer.trim() }
                    : f
                ),
              }
            : p
        ) as unknown as ProductWithFAQs[]
      );

      setEditingFaqId(null);
      setEditQuestion('');
      setEditAnswer('');
      toast.success("FAQ yeniləndi");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xəta baş verdi";
      toast.error(message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleGenerateAIFAQ = (product: ProductWithFAQs) => {
    const translation = product.translations?.find((t: any) => t.locale === 'az') 
      || product.translations?.[0];
    
    if (!translation?.description) {
      toast.warning("FAQ yaratmaq üçün əvvəlcə məhsul təsviri əlavə edin");
      return;
    }
    
    setQuestionnaireProductId(product.id);
    setShowQuestionnaire(true);
    setTopQuestions('');
    setMainDifference('');
    setSupportInfo('');
    setSelectedIntents(['what_is', 'pricing', 'how_to', 'comparison', 'trust']);
  };

  const toggleIntent = (id: string) => {
    setSelectedIntents(prev => 
      prev.includes(id) 
        ? prev.length > 1 ? prev.filter((i: any) => i !== id) : prev
        : [...prev, id]
    );
  };

  const handleCloseQuestionnaire = () => {
    const hasData = topQuestions.trim() || mainDifference.trim() || supportInfo.trim();
    if (hasData) {
      const confirmed = window.confirm(
        'Doldurulmuş məlumatlar silinəcək. Çıxmaq istəyirsiniz?'
      );
      if (!confirmed) return;
    }
    setShowQuestionnaire(false);
  };

  const handleSubmitQuestionnaire = async () => {
    const product = products.find((p: any) => p.id === questionnaireProductId);
    if (!product) return;

    const translation = product.translations?.find((t: any) => t.locale === 'az') 
      || product.translations?.[0];
    const description = translation?.description || '';
    const productName = translation?.name || product.slug;

    setShowQuestionnaire(false);
    setGeneratingFor(product.id);
    setExpandedProduct(product.id);
    setIsGeneratingAI(true);
    setAiFAQs([]);

    try {
      const response = await fetch("/api/ai-faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          productName,
          topQuestions: topQuestions.trim(),
          mainDifference: mainDifference.trim(),
          supportInfo: supportInfo.trim(),
          selectedIntents,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "AI generation error");
      }

      const { faqs } = await response.json();
      setAiFAQs(faqs.map((f: { question: string; answer: string }) => ({ 
        ...f, selected: true 
      })));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "FAQ yaradarkən xəta baş verdi";
      toast.error(message);
      setGeneratingFor(null);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveSelectedFAQs = async (productId: string) => {
    const selected = aiFAQs.filter((f: any) => f.selected);
    if (selected.length === 0) return;

    setIsSubmitting(true);
    try {
      const { saveMultipleFAQsAction } = await import('../../actions');
      const data = await saveMultipleFAQsAction(productId, selected);

      // Update local state
      setProducts((prev) =>
        prev.map((p: any) =>
          p.id === productId
            ? { ...p, faqs: [...(data as unknown as FAQ[]), ...p.faqs] }
            : p
        ) as unknown as ProductWithFAQs[]
      );

      setAiFAQs([]);
      setGeneratingFor(null);
      
      const savedProduct = products.find((p: any) => p.id === productId);
      toast.success(`${selected.length} FAQ yadda saxlanıldı`, {
        action: savedProduct?.slug ? {
          label: "Məhsulda bax",
          onClick: () => window.open(`/products/${savedProduct.slug}`, '_blank')
        } : undefined
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xəta baş verdi";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAllFAQs = (select: boolean) => {
    setAiFAQs(prev => prev.map((f: any) => ({ ...f, selected: select })));
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded-xl" />
          <div className="h-4 w-96 bg-gray-100 rounded-xl" />
        </div>
        {Array.from({ length: 3 }).map((_: any, i: any) => (
          <div key={i} className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
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
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Forum & FAQ</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Məhsullarınıza tez-tez verilən sualları əlavə edin — AI axtarışda görünsün
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl border p-4 flex items-start gap-3"
        style={{
          borderColor: "color-mix(in oklab, var(--accent) 25%, transparent)",
          backgroundColor: "color-mix(in oklab, var(--accent) 6%, transparent)",
        }}>
        <HelpCircle size={16} style={{ color: "var(--accent)" }} className="flex-shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed text-[var(--accent)]">
          FAQ-lar <strong>FAQPage JSON-LD</strong> ilə işarələnir.
          ChatGPT, Perplexity kimi AI axtarışlarda birbaşa görünür.{" "}
          <span className="font-bold">Hər məhsulda minimum 5 FAQ tövsiyə olunur.</span>
        </p>
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <Card className="border-dashed border-2 py-16 flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center dark:bg-white/5">
            <MessageSquare className="h-8 w-8 text-gray-300" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-gray-900 dark:text-gray-100">Hələ məhsul əlavə etməmisiniz</p>
            <p className="text-sm text-gray-500">FAQ əlavə etmək üçün əvvəlcə məhsul yaradın</p>
          </div>
          <a href="/dashboard/add-content">
            <PrimaryButton type="button" className="px-5 py-2.5">
              <Plus size={16} />
              Məhsul əlavə et
            </PrimaryButton>
          </a>
        </Card>
      )}

      {/* Products list */}
      <div className="space-y-3">
        {products.map((product: any) => {
          const name = product.translations?.[0]?.name || product.slug;
          const isExpanded = expandedProduct === product.id;
          const isAddingFAQ = addingFAQFor === product.id;
          const isGenerating = generatingFor === product.id;

          const initials = name
            .split(" ")
            .slice(0, 2)
            .map((w: string) => w[0])
            .join("")
            .toUpperCase();

          return (
            <Card key={product.id}>
              {/* Product header row */}
              <ProductHeaderRow onClick={() => setExpandedProduct(isExpanded ? null : product.id)}>
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold overflow-hidden"
                    style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} className="w-full h-full object-cover" alt={name} />
                    ) : (
                      <span>{initials || "PR"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge variant={product.status === "active" ? "active" : "draft"}>
                        {product.status === "active" ? "Aktiv" : "Qaralama"}
                      </StatusBadge>
                      <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                        {product.faqs.length} FAQ
                      </span>
                      {product.faqs.length >= 5 ? (
                        <StatusBadge variant="active">✓ Tam əhatəli</StatusBadge>
                      ) : product.faqs.length > 0 ? (
                        <StatusBadge variant="warning">{5 - product.faqs.length} FAQ əksikdir</StatusBadge>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleGenerateAIFAQ(product)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    style={{ backgroundColor: "color-mix(in oklab, var(--accent) 12%, transparent)", color: "var(--accent)", border: "none" }}>
                    <Sparkles size={13} />AI ilə FAQ yarat
                  </button>
                  <SmallSecondaryButton
                    onClick={() => { 
                      setAddingFAQFor(isAddingFAQ ? null : product.id); 
                      setExpandedProduct(product.id); 
                      setQuestion(""); 
                      setAnswer(""); 
                    }}
                  >
                    <Plus size={13} />FAQ əlavə et
                  </SmallSecondaryButton>
                  {isExpanded ? (
                    <ChevronUp size={16} style={{ color: "var(--muted-foreground)" }} />
                  ) : (
                    <ChevronDown size={16} style={{ color: "var(--muted-foreground)" }} />
                  )}
                </div>
              </ProductHeaderRow>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t" style={{ borderColor: "var(--border)" }}>

                  {/* AI Generation panel */}
                  {isGenerating && (
                    <div className="p-5 border-b space-y-4" style={{
                      borderColor: "var(--border)",
                      backgroundColor: "color-mix(in oklab, var(--accent) 4%, transparent)",
                    }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
                            <Brain size={15} />
                          </div>
                          <p className="text-[13px] font-bold text-[var(--foreground)]">AI FAQ Generasiyası</p>
                        </div>
                        {!isGeneratingAI && aiFAQs.length > 0 && (
                          <div className="flex gap-3">
                            <button className="text-[10px] font-bold uppercase tracking-tight cursor-pointer"
                              style={{ color: "var(--accent)", border: "none", background: "none" }}
                              onClick={() => toggleAllFAQs(true)}>
                              Hamısını seç
                            </button>
                            <button className="text-[10px] font-bold uppercase tracking-tight cursor-pointer"
                              style={{ color: "var(--muted-foreground)", border: "none", background: "none" }}
                              onClick={() => toggleAllFAQs(false)}>
                              Heç birini seçmə
                            </button>
                          </div>
                        )}
                      </div>

                      {isGeneratingAI ? (
                        <div className="py-10 flex flex-col items-center gap-3">
                          <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
                          <p className="text-sm font-medium text-[var(--foreground)]">FAQ-lar hazırlanır...</p>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Məhsul təsviri analiz edilir</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {aiFAQs.map((faq: any, idx: any) => (
                            <div key={idx}
                              onClick={() => setAiFAQs(prev => prev.map((f: any, i: any) => i === idx ? { ...f, selected: !f.selected } : f))}
                              className="flex gap-3 rounded-xl border p-4 cursor-pointer transition-all"
                              style={{
                                borderColor: faq.selected ? "color-mix(in oklab, var(--accent) 40%, transparent)" : "var(--border)",
                                backgroundColor: faq.selected ? "color-mix(in oklab, var(--accent) 6%, transparent)" : "transparent",
                                opacity: faq.selected ? 1 : 0.6,
                              }}>
                              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors"
                                style={{
                                  backgroundColor: faq.selected ? "var(--accent)" : "transparent",
                                  borderColor: faq.selected ? "var(--accent)" : "var(--border)",
                                }}>
                                {faq.selected && <Check size={11} style={{ color: "var(--accent-foreground)" }} />}
                              </div>
                              <div className="space-y-1 min-w-0">
                                <p className="text-xs font-bold text-[var(--foreground)]">{faq.question}</p>
                                <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{faq.answer}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2 justify-end pt-2">
                            <SecondaryButton onClick={() => { setGeneratingFor(null); setAiFAQs([]); }}>
                              Ləğv et
                            </SecondaryButton>
                            <PrimaryButton 
                              disabled={aiFAQs.filter((f: any) => f.selected).length === 0 || isSubmitting}
                              onClick={() => handleSaveSelectedFAQs(product.id)}
                            >
                              {isSubmitting ? (
                                <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saxlanılır...</>
                              ) : (
                                `Seçilənləri saxla (${aiFAQs.filter((f: any) => f.selected).length})`
                              )}
                            </PrimaryButton>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add FAQ form */}
                  {isAddingFAQ && (
                    <div className="p-5 border-b space-y-4"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "color-mix(in oklab, var(--accent) 4%, transparent)",
                      }}>
                      <p className="text-[13px] font-bold text-[var(--foreground)]">Yeni FAQ</p>
                      
                      <Field label="Sual">
                        <input 
                          value={question} 
                          onChange={(e) => setQuestion(e.target.value)} 
                          placeholder="məs: Bu məhsulun qiyməti nədir?" 
                          className={inputClass} 
                          style={inputStyle} 
                        />
                      </Field>
                      
                      <Field 
                        label="Cavab" 
                        hint={`${answer.trim().split(/\s+/).filter(Boolean).length} söz · min 40 söz tövsiyə olunur`}
                      >
                        <textarea 
                          rows={3} 
                          value={answer} 
                          onChange={(e) => setAnswer(e.target.value)} 
                          placeholder="Sualın ətraflı cavabını yazın..."
                          className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]" 
                          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }} 
                        />
                      </Field>
                      
                      <div className="flex gap-2 justify-end">
                        <SecondaryButton onClick={() => { setAddingFAQFor(null); setQuestion(""); setAnswer(""); }}>
                          Ləğv et
                        </SecondaryButton>
                        <PrimaryButton 
                          disabled={!question.trim() || !answer.trim() || isSubmitting} 
                          onClick={() => handleAddFAQ(product.id)}
                        >
                          {isSubmitting ? (
                            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Əlavə edilir...</>
                          ) : (
                            "Əlavə et"
                          )}
                        </PrimaryButton>
                      </div>
                    </div>
                  )}

                  {/* FAQ list */}
                  {product.faqs.length === 0 && !isAddingFAQ && !isGenerating ? (
                    <div className="p-10 flex flex-col items-center gap-4 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: "var(--muted)" }}>
                        <MessageSquare size={20} style={{ color: "var(--muted-foreground)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">Hələ FAQ yoxdur</p>
                        <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>AI ilə avtomatik yarat və ya özünüz əlavə edin</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerateAIFAQ(product)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer"
                          style={{ backgroundColor: "color-mix(in oklab, var(--accent) 12%, transparent)", color: "var(--accent)", border: "none" }}>
                          <Sparkles size={13} />AI ilə yarat
                        </button>
                        <SmallSecondaryButton
                          onClick={() => { setAddingFAQFor(product.id); setQuestion(""); setAnswer(""); }}
                        >
                          <Plus size={13} />Özünüz əlavə edin
                        </SmallSecondaryButton>
                      </div>
                    </div>
                  ) : (
                    <ul>
                      {product.faqs.map((faq: any, i: any) => (
                        <li key={faq.id}
                          className={`group p-5 ${i !== product.faqs.length - 1 ? "border-b" : ""}`}
                          style={{ borderColor: "var(--border)" }}>
                          {editingFaqId === faq.id ? (
                            // Edit mode
                            <div className="space-y-3">
                              <Field label="Sual">
                                <input 
                                  value={editQuestion} 
                                  onChange={(e) => setEditQuestion(e.target.value)} 
                                  className={inputClass} 
                                  style={inputStyle} 
                                />
                              </Field>
                              
                              <Field 
                                label="Cavab"
                                hint={`${editAnswer.trim().split(/\s+/).filter(Boolean).length} söz · min 40 söz tövsiyə olunur`}
                              >
                                <textarea 
                                  rows={3} 
                                  value={editAnswer} 
                                  onChange={(e) => setEditAnswer(e.target.value)}
                                  className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]" 
                                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }} 
                                />
                              </Field>
                              
                              <div className="flex gap-2 justify-end">
                                <SecondaryButton onClick={() => { setEditingFaqId(null); setEditQuestion(""); setEditAnswer(""); }}>
                                  Ləğv et
                                </SecondaryButton>
                                <PrimaryButton 
                                  disabled={!editQuestion.trim() || !editAnswer.trim() || isEditing}
                                  onClick={() => handleEditFAQ(faq.id, product.id)}
                                >
                                  {isEditing ? (
                                    <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saxlanılır...</>
                                  ) : (
                                    "Yadda saxla"
                                  )}
                                </PrimaryButton>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <div className="flex gap-4 items-start">
                              <div className="flex-1 space-y-1.5 min-w-0">
                                <p className="text-sm font-semibold text-[var(--foreground)]">{faq.question}</p>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{faq.content}</p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                                <IconButton
                                  onClick={() => {
                                    setEditingFaqId(faq.id);
                                    setEditQuestion(faq.question);
                                    setEditAnswer(faq.content);
                                  }}
                                >
                                  <Pencil size={14} />
                                </IconButton>
                                <IconButton
                                  onClick={() => setDeleteTarget({ faqId: faq.id, productId: product.id })}
                                >
                                  <Trash2 size={14} />
                                </IconButton>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
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
                if (deleteTarget) handleDeleteFAQ(deleteTarget.faqId, deleteTarget.productId);
              }}
              className="bg-red-600 hover:bg-red-500 rounded-xl"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI FAQ Questionnaire Modal */}
      {showQuestionnaire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={handleCloseQuestionnaire}>
          <div className="w-full max-w-lg rounded-2xl border p-6 space-y-5 shadow-xl relative"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
                  <Brain size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--foreground)]">AI FAQ Sehrbazı</h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Daha keyfiyyətli FAQ üçün bir neçə sual</p>
                </div>
              </div>
              <CloseButton onClick={handleCloseQuestionnaire} />
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <Field label="Müştəriləriniz ən çox nə soruşur?">
                <textarea 
                  rows={2} 
                  value={topQuestions}
                  onChange={(e) => setTopQuestions(e.target.value)}
                  placeholder="məs: qiymət, inteqrasiya, texniki dəstək..."
                  className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]" 
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }} 
                />
              </Field>
              
              <Field label="Rəqiblərdən əsas fərqiniz nədir?">
                <textarea 
                  rows={2} 
                  value={mainDifference}
                  onChange={(e) => setMainDifference(e.target.value)}
                  placeholder="məs: 24/7 dəstək, Azərbaycan vergi sisteminə uyğun..."
                  className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]" 
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }} 
                />
              </Field>
              
              <Field label="Dəstək və zəmanət məlumatı">
                <textarea 
                  rows={2} 
                  value={supportInfo}
                  onChange={(e) => setSupportInfo(e.target.value)}
                  placeholder="məs: 30 günlük pulsuz sınaq, WhatsApp dəstəyi..."
                  className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]" 
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }} 
                />
              </Field>
            </div>

            {/* Intent selection */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[var(--foreground)]">Hansı tip suallar yaradılsın?</p>
              <div className="flex flex-wrap gap-2">
                {intents.map((intent: any) => {
                  const isSelected = selectedIntents.includes(intent.id);
                  return (
                    <button 
                      key={intent.id}
                      type="button"
                      onClick={() => toggleIntent(intent.id)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all border cursor-pointer"
                      style={isSelected
                        ? { backgroundColor: "var(--accent)", color: "var(--accent-foreground)", borderColor: "var(--accent)" }
                        : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                      <span>{intent.icon}</span>
                      <span>{intent.label}</span>
                      {isSelected && <Check size={11} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 justify-end pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <SecondaryButton onClick={handleCloseQuestionnaire}>Ləğv et</SecondaryButton>
              <PrimaryButton 
                disabled={selectedIntents.length < 1} 
                onClick={handleSubmitQuestionnaire}
              >
                <Sparkles size={14} /> FAQ Yarat
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
