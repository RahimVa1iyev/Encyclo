// app/(dashboard)/dashboard/add-content/page.tsx
"use client";
import { getSession } from "next-auth/react";

import { useEffect, useState, useMemo } from "react";
import { cn, slugify } from "@/lib/utils";
import {
  X,
  Upload,
  Loader2,
  CheckCircle2,
  FileText,
  Search,
  ArrowLeft,
  Sparkles,
  Type,
  DollarSign,
  Tag,
  Globe,
  Wand2,
  Languages,
  MessageSquare,
  Phone,
  Info
} from "lucide-react";
import type { Category, Company, CompanyTranslation } from "@/types";
import { Link } from '@/lib/navigation';
import { toast } from "sonner";
import { PLAN_LIMITS } from "@/lib/constants/plans";
import {
  Card,
  CardHeader,
  Field,
  PrimaryButton,
  SecondaryButton,
  getHintColor,
  inputClass,
  inputStyle,
} from "@/components/dashboard-ui";

// Form types
type ProductType = "product" | "service";
type PriceType = "Fixed" | "Starting from" | "Contact us";
type Locale = "AZ" | "EN" | "RU";

type LocaleContent = {
  name: string
  description: string
  metaTitle: string
  metaDescription: string
  keywords?: string[]
}

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "AZ", label: "AZ" },
  { code: "EN", label: "EN" },
  { code: "RU", label: "RU" },
];

export default function AddContentPage() {
  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [company, setCompany] = useState<(Company & { translations: CompanyTranslation[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<keyof typeof PLAN_LIMITS>("starter");
  const [productCount, setProductCount] = useState(0);

  // Form State
  const [type, setType] = useState<ProductType>("product");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("AZN");
  const [priceType, setPriceType] = useState<PriceType>("Fixed");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState<{ file: File; preview: string; id: string }[]>([]);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const [activeLocale, setActiveLocale] = useState<Locale>("AZ");
  const [contentByLocale, setContentByLocale] = useState<Record<string, LocaleContent>>({
    az: { name: "", description: "", metaTitle: "", metaDescription: "" }
  });

  const activeContent = contentByLocale[activeLocale.toLowerCase()] || { name: "", description: "", metaTitle: "", metaDescription: "" };

  const localesWithContent = Object.entries(contentByLocale)
    .filter(([_, content]) => (content.name || '').trim().length > 0 && (content.description || '').trim().length > 0)
    .map(([locale]) => locale);

  const updateContent = (field: keyof LocaleContent, value: string) => {
    setContentByLocale(prev => ({
      ...prev,
      [activeLocale.toLowerCase()]: {
        ...(prev[activeLocale.toLowerCase()] || { name: "", description: "", metaTitle: "", metaDescription: "" }),
        [field]: value
      }
    }));
  };

  const updateContentForLocale = (locale: string, field: keyof LocaleContent, value: string) => {
    setContentByLocale(prev => ({
      ...prev,
      [locale]: { ...(prev[locale] || { name: "", description: "", metaTitle: "", metaDescription: "" }), [field]: value }
    }));
  };

  // Company kontakt state-lər:
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  // Məhsul-spesifik override state-lər (boş başlayır):
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactCustomUrl, setContactCustomUrl] = useState("");
  const [contactCustomLabel, setContactCustomLabel] = useState("");
  const [leadsEnabled, setLeadsEnabled] = useState(false);

  // AI translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // AI generator panel state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<{ text: string; placeholder: string }[]>([]);
  const [aiAnswers, setAiAnswers] = useState<Record<number, string>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiPanelError, setAiPanelError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedMeta, setGeneratedMeta] = useState<string | null>(null);

  // AI keywords suggestions
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [keywordError, setKeywordError] = useState<string | null>(null);

  // GEO Score useMemo (7 criteria)
  const geoScore = useMemo(() => {
    const azContent = contentByLocale.az || contentByLocale.AZ || { name: "", description: "", metaTitle: "", metaDescription: "" };
    
    const wordCount = (azContent.description || '').trim().split(/\s+/).filter(Boolean).length;
    const questionCount = (azContent.description || '').split('\n').filter(line => line.trim().endsWith('?')).length;
    const hasQuestion = questionCount >= 3;
    const hasPrice = price.length > 0;
    const hasKeywords = tags.length > 0;
    const hasMinWords = wordCount >= 150;
    const hasMetaTitle = (azContent.metaTitle || '').length >= 10;
    const hasImage = files.length > 0;
    
    const enContent = contentByLocale.en || contentByLocale.EN;
    const hasEnglish = !!((enContent?.name || '').trim() && (enContent?.description || '').trim().length > 50);

    const checks = [
      { key: "words", label: `${wordCount} söz`, passed: hasMinWords, tip: "Minimum 150 söz lazımdır" },
      { key: "question", label: "Sual var (?)", passed: hasQuestion, tip: "Ən azı 3 sual əlavə edin (?)" },
      { key: "price", label: "Qiymət var", passed: hasPrice, tip: "Qiymət məlumatı əlavə edin" },
      { key: "keywords", label: "Açar söz var", passed: hasKeywords, tip: "Ən azı 1 açar söz əlavə edin" },
      { key: "metaTitle", label: "Meta başlıq var", passed: hasMetaTitle, tip: "Minimum 10 hərfdən ibarət başlıq" },
      { key: "image", label: "Şəkil var", passed: hasImage, tip: "Ən azı 1 şəkil əlavə edin" },
      { key: "english", label: "İngilis dili", passed: hasEnglish, tip: "İngilis dilinə tərcümə əlavə edin" },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    const percentage = Math.round((passedCount / checks.length) * 100);

    return { checks, percentage, passedCount, total: checks.length };
  }, [contentByLocale, price, tags, files]);

  // Fetch initial data
  useEffect(() => {
    async function init() {
      const session = await getSession();
      const user = session?.user;
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { getAddContentData } = await import('../../actions');
      const data = await getAddContentData();
      
      if (!data || !data.company) {
        window.location.href = "/onboarding";
        return;
      }

      setCompany(data.company as any);
      setCompanyPhone(data.company.phone || "");
      setCompanyEmail(data.company.email || "");
      setCompanyWebsite(data.company.website || "");

      setPlan(data.planId as keyof typeof PLAN_LIMITS);
      setProductCount(data.productCount);

      if (data.categories) setCategories(data.categories as any[]);

      setIsLoading(false);
    }
    init();
  }, []);

  // Tag list handlers
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();

    const value = tagInput.trim().replace(/,$/, "");
    if (value && !tags.includes(value) && tags.length < 10) {
      setTags([...tags, value]);
      setTagInput("");
    }
  };

  // Image files handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (files.length + newFiles.length > 5) return;

    newFiles.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Şəkil ölçüsü 5MB-dan böyük ola bilməz');
        return;
      }
      const preview = URL.createObjectURL(file);
      setFiles((prev) => [
        ...prev,
        { file, preview, id: Math.random().toString(36).substr(2, 9) },
      ]);
    });
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const categoryName = selectedCategory?.name || "";

  // AI Content Handlers
  const handleGetQuestions = async () => {
    if (!activeContent.name || !categoryId) return;
    setIsLoadingQuestions(true);
    setAiPanelError(null);
    setAiQuestions([]);
    setAiAnswers({});
    setGeneratedContent(null);
    setShowAIPanel(true);

    try {
      const res = await fetch("/api/ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "questions",
          name: activeContent.name,
          category: categoryName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xəta baş verdi");
      setAiQuestions(data.questions);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Suallar yüklənmədi";
      setAiPanelError(message);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleGenerateContent = async () => {
    const answeredCount = Object.values(aiAnswers).filter((a) => a.trim()).length;
    if (answeredCount < 3) return;
    setIsGeneratingContent(true);
    setAiPanelError(null);
    try {
      const answers = aiQuestions
        .map((question, i) => ({
          question: question.text,
          answer: aiAnswers[i] || "",
        }))
        .filter((a) => a.answer.trim());
      const res = await fetch("/api/ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          name: activeContent.name,
          category: categoryName,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xəta baş verdi");
      setGeneratedContent(data.description);
      if (data.metaDescription) setGeneratedMeta(data.metaDescription);
      if (data.metaTitle) updateContentForLocale('az', 'metaTitle', data.metaTitle);
      if (data.metaDescription) updateContentForLocale('az', 'metaDescription', data.metaDescription);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Məzmun yaradılmadı";
      setAiPanelError(message);
    } finally {
      setIsGeneratingContent(false);
    }
  };



  const handleSuggestKeywords = async () => {
    if (!activeContent.description || activeContent.description.length < 50) return;
    setIsLoadingKeywords(true);
    setKeywordError(null);
    setAiKeywords([]);
    try {
      const res = await fetch("/api/ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "keywords",
          name: activeContent.name,
          category: categoryName,
          description: activeContent.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xəta baş verdi");
      const newKeywords = (data.keywords as string[]).filter(
        (k) => !tags.includes(k)
      );
      setAiKeywords(newKeywords);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Açar sözlər yüklənmədi";
      setKeywordError(message);
    } finally {
      setIsLoadingKeywords(false);
    }
  };

  const handleTranslateSingle = async (targetLocale: string) => {
    const azContent = contentByLocale.az || contentByLocale.AZ;
    if (!azContent?.name || !azContent?.description) {
      toast.error("Əvvəlcə Azərbaycan dilində ad və təsvir əlavə edin.");
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const res = await fetch("/api/ai-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: azContent.name,
          description: azContent.description,
          targetLocales: [targetLocale],
          tags: tags,
        }),
      });

      if (!res.ok) throw new Error("Tərcümə xətası");
      const data = await res.json();
      const translation = data.translations[targetLocale.toLowerCase()];
      
      if (translation) {
        const tName = typeof translation.name === 'string' ? translation.name : String(translation.name || '')
        
        // Description object gəlsə string-ə çevir
        let tDesc = ''
        if (typeof translation.description === 'string') {
          tDesc = translation.description
        } else if (typeof translation.description === 'object' && translation.description !== null) {
          // Object-i sual-cavab formatında string-ə çevir
          tDesc = Object.entries(translation.description)
            .map(([_, value]) => String(value))
            .join('\n\n')
        }

        const tKeywords = Array.isArray(translation.keywords) ? translation.keywords : []
        
        setContentByLocale(prev => ({
          ...prev,
          [targetLocale.toLowerCase()]: {
            name: tName,
            description: tDesc,
            metaTitle: tName.slice(0, 60),
            metaDescription: tDesc.replace(/\n/g, ' ').slice(0, 160),
            keywords: tKeywords,
          }
        }))
        toast.success(`${targetLocale.toUpperCase()} dilinə tərcümə edildi!`)
      }
    } catch (err) {
      console.error(err);
      setTranslationError("Tərcümə zamanı xəta baş verdi.");
      toast.error("Tərcümə zamanı xəta baş verdi.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Submit and upload logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const azContent = contentByLocale.az || contentByLocale.AZ || { name: "", description: "" };
    if (!(azContent.name || '').trim() || !(azContent.description || '').trim() || !categoryId || isSubmitting) return;

    const limit = PLAN_LIMITS[plan]?.products || 5;
    if (productCount >= limit) {
      toast.error(`Sizin "${plan}" planınızda maksimum ${limit} məhsul əlavə edə bilərsiniz. Limitiniz dolub.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload Media
      const uploadPromises = files.map(async (item) => {
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('folder', 'products');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Fayl yüklənərkən xəta baş verdi');
        }

        const data = await uploadRes.json();
        return data.url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);

      const { checkProductSlugExists, createProductAction } = await import('../../actions');
      let slug = slugify(activeContent.name);
      
      const slugExists = await checkProductSlugExists(company!.id, slug);

      if (slugExists) {
        slug = `${slugify(activeContent.name)}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const productData = {
        slug,
        status: "active",
        images: uploadedUrls,
        type,
        category_id: categoryId,
        contact_options: {
          ...(contactPhone.trim() && { phone: contactPhone.trim() }),
          ...(contactWhatsapp.trim() && { whatsapp: contactWhatsapp.trim() }),
          ...(contactCustomUrl.trim() && { custom_url: contactCustomUrl.trim() }),
          ...(contactCustomLabel.trim() && { custom_label: contactCustomLabel.trim() }),
        },
        leads_enabled: leadsEnabled,
      };

      const translations = Object.entries(contentByLocale)
        .filter(([_, content]) => content.name.trim().length > 0)
        .map(([locale, content]) => ({
          locale,
          name: content.name,
          description: content.description,
          meta_title: content.metaTitle || content.name,
          meta_description: content.metaDescription || content.description.slice(0, 160),
          features: {
            keywords: content.keywords || tags,
            price: price ? parseFloat(price) : undefined,
            currency,
            price_type: priceType,
          },
        }));

      const result = await createProductAction(company!.id, productData, translations);
      
      setCreatedSlug(result.slug);

      if (!contentByLocale.en?.name) {
        toast.info("💡 İngilis dilində kontent əlavə etsəniz, AI axtarışda görünmə şansınız 2x artacaq.", {
          duration: 6000,
          action: {
            label: "Redaktə et",
            onClick: () => window.location.href = `/dashboard/products/${result.productId}/edit`
          }
        })
      }

      setSuccessMessage("Məhsul uğurla əlavə edildi və ensiklopediyada yayımlandı!");
      setTimeout(() => {
        window.location.href = "/dashboard/products";
      }, 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xəta baş verdi. Yenidən cəhd edin.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading skeleton screen
  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded-xl" />
          <div className="h-4 w-96 bg-gray-100 rounded-xl" />
        </div>
        
        {/* Grid layout */}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border bg-surface p-5 space-y-4" style={{ borderColor: "var(--border)" }}>
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded-xl" />
              <div className="h-10 w-full bg-gray-100 rounded-xl" />
            </div>
            <div className="rounded-2xl border bg-surface p-5 space-y-4" style={{ borderColor: "var(--border)" }}>
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-32 w-full bg-gray-100 rounded-xl" />
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl border bg-surface p-5 space-y-4" style={{ borderColor: "var(--border)" }}>
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      id="add-content-form"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Yeni məhsul</h2>
        <p className="mt-1 text-sm text-muted-foreground">AI köməyi ilə optimallaşdırılmış məzmun yaradın</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Sol tərəf - Form Blokları */}
        <div className="space-y-5 lg:col-span-2">
          
          {/* Blok 1 - Əsas məlumatlar */}
          <Card>
            <CardHeader icon={Type} title="Əsas məlumatlar" subtitle="Məhsulun adı və növü" />
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                {["product", "service"].map((t) => (
                  <button 
                    key={t} 
                    type="button"
                    onClick={() => setType(t as ProductType)}
                    className="flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all cursor-pointer"
                    style={type === t
                      ? { backgroundColor: "var(--accent)", color: "var(--accent-foreground)", borderColor: "var(--accent)" }
                      : { borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    {t === "product" ? "Məhsul" : "Xidmət"}
                  </button>
                ))}
              </div>
              
              <Field
                label="Məhsul adı"
                hint={`${activeContent.name.length} / 100`}
                hintColor={getHintColor(activeContent.name.length, 100)}
              >
                <input 
                  required
                  value={activeContent.name} 
                  onChange={(e) => updateContent('name', e.target.value.slice(0, 100))}
                  placeholder={type === "product" ? "e.g. Biznes Kartı, CRM Proqramı" : "e.g. Veb Sayt Hazırlanması"}
                  className={inputClass} 
                  style={inputStyle} 
                />
              </Field>

              <Field label="Kateqoriya">
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)} 
                  required
                  className={inputClass} 
                  style={inputStyle}
                >
                  <option value="">Kateqoriya seçin</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          {/* Blok 2 - Məzmun */}
          <Card>
            <CardHeader 
              icon={FileText} 
              title="Məzmun" 
              subtitle="Məhsulun ətraflı təsviri"
              right={
                <button 
                  type="button"
                  onClick={handleGetQuestions}
                  disabled={!activeContent.name || !categoryId || isLoadingQuestions}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-95"
                  style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}
                >
                  <Sparkles size={13} />AI ilə yarat
                </button>
              }
            />
            
            {(!activeContent.name || !categoryId) && (
              <p className="mt-3 text-[10px] text-center text-muted-foreground select-none">
                AI-ı aktivləşdirmək üçün əvvəlcə ad və kateqoriya doldurun.
              </p>
            )}

            {/* AI Generator Panel */}
            {showAIPanel && (
              <div 
                className="mt-4 rounded-xl border p-4 space-y-4"
                style={{
                  borderColor: "color-mix(in oklab, var(--accent) 25%, transparent)",
                  backgroundColor: "color-mix(in oklab, var(--accent) 6%, transparent)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wand2 size={14} style={{ color: "var(--accent)" }} />
                    <span className="text-xs font-bold text-[var(--foreground)]">AI Köməkçisi</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAIPanel(false);
                      setAiQuestions([]);
                      setAiAnswers({});
                      setGeneratedContent(null);
                      setAiPanelError(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                {isLoadingQuestions && (
                  <div className="py-8 flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" style={{ color: "var(--accent)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                      Suallar hazırlanır...
                    </p>
                  </div>
                )}

                {!isLoadingQuestions && aiQuestions.length > 0 && !generatedContent && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-muted-foreground">
                      Ən azı 3 suala cavab verin. Nə qədər ətraflı olsa, məzmun bir o qədər yaxşı olacaq.
                    </p>
                    {aiQuestions.map((question, i) => (
                      <div key={i}>
                        <label className="mb-1 block text-[11px] font-semibold text-[var(--foreground)]">{question.text}</label>
                        <textarea 
                          rows={2} 
                          value={aiAnswers[i] || ""}
                          onChange={(e) =>
                            setAiAnswers((prev) => ({
                              ...prev,
                              [i]: e.target.value,
                            }))
                          }
                          placeholder={question.placeholder}
                          className="w-full rounded-xl border bg-surface p-2 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]" 
                          style={inputStyle} 
                        />
                      </div>
                    ))}

                    {aiPanelError && (
                      <p className="text-xs text-red-500">{aiPanelError}</p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <PrimaryButton
                        type="button"
                        onClick={handleGenerateContent}
                        disabled={Object.values(aiAnswers).filter((a) => a.trim()).length < 3 || isGeneratingContent}
                        className="flex-1"
                      >
                        {isGeneratingContent ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Məzmun yazılır...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} /> Generate
                          </>
                        )}
                      </PrimaryButton>
                      <SecondaryButton type="button" onClick={() => setShowAIPanel(false)}>Bağla</SecondaryButton>
                    </div>
                  </div>
                )}

                {generatedContent && (
                  <div className="space-y-4">
                    <div className="bg-surface border rounded-xl p-4 space-y-2" style={{ borderColor: "var(--border)" }}>
                      <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
                        <Sparkles className="h-3.5 w-3.5" /> Yaradılmış məzmun
                        <span className="ml-auto text-[10px] font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
                          Meta datalar avtomatik yeniləndi
                        </span>
                      </p>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {generatedContent
                          .split(/\n{2,}/)
                          .filter((block) => block.trim())
                          .map((block, i) => {
                            const lines = block
                              .trim()
                              .split("\n")
                              .filter((l) => l.trim());
                            if (lines.length === 0) return null;
                            const firstLine = lines[0].trim();
                            const isQuestion = firstLine.endsWith("?");
                            const answerLines = isQuestion
                              ? lines.slice(1)
                              : lines;

                            return (
                              <div key={i} className="space-y-0.5">
                                {isQuestion && (
                                  <p className="text-xs font-bold" style={{ color: "var(--accent)" }}>
                                    {firstLine}
                                  </p>
                                )}
                                {answerLines.length > 0 && (
                                  <p className="text-sm text-[var(--foreground)] leading-relaxed">
                                    {answerLines.join(" ")}
                                  </p>
                                )}
                                {!isQuestion && (
                                  <p className="text-sm text-[var(--foreground)] leading-relaxed">
                                    {firstLine}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    {aiPanelError && (
                      <p className="text-xs text-red-500">{aiPanelError}</p>
                    )}
                    <div className="flex gap-3">
                      <SecondaryButton
                        type="button"
                        onClick={() => {
                          setGeneratedContent(null);
                          setAiAnswers({});
                        }}
                        className="flex-1"
                      >
                        Yenidən cəhd et
                      </SecondaryButton>
                      <PrimaryButton
                        type="button"
                        onClick={() => {
                          const safeContent =
                            generatedContent.length > 3000
                              ? generatedContent.slice(
                                0,
                                generatedContent.lastIndexOf(" ", 3000)
                              )
                              : generatedContent;
                          updateContent('description', safeContent);
                          if (generatedMeta) {
                            updateContent('metaDescription', generatedMeta.slice(0, 160));
                          }
                          setShowAIPanel(false);
                          setAiQuestions([]);
                          setAiAnswers({});
                          setGeneratedContent(null);
                          setGeneratedMeta(null);

                          setTimeout(() => {
                            const textarea = document.getElementById("description-textarea");
                            if (textarea) {
                              textarea.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                              textarea.focus();
                            }
                          }, 100);
                        }}
                        className="flex-1"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Tətbiq et
                      </PrimaryButton>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <Field
                label="Təsvir"
                hint={`${activeContent.description.length} / 3000`}
                hintColor={getHintColor(activeContent.description.length, 3000)}
              >
                <textarea 
                  id="description-textarea"
                  required
                  rows={6} 
                  value={activeContent.description}
                  onChange={(e) => {
                    updateContent('description', e.target.value.slice(0, 3000));
                  }}
                  placeholder="Məhsulunuz haqqında ətraflı yazın..."
                  className="w-full rounded-xl border bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]" 
                  style={inputStyle} 
                />
              </Field>
            </div>
          </Card>

          {/* Blok 3 - SEO məlumatları */}
          <Card>
            <CardHeader icon={Search} title="SEO məlumatları" subtitle="Axtarış mühərrikləri üçün" />
            <div className="mt-4 space-y-4">
              <Field
                label="Meta title"
                hint={`${activeContent.metaTitle.length} / 60`}
                hintColor={getHintColor(activeContent.metaTitle.length, 60)}
              >
                <input 
                  value={activeContent.metaTitle}
                  onChange={(e) => updateContent('metaTitle', e.target.value.slice(0, 60))}
                  placeholder="ChatGPT axtarış başlığı..."
                  className={inputClass} 
                  style={inputStyle} 
                />
              </Field>
              <Field
                label="Meta description"
                hint={`${activeContent.metaDescription.length} / 160`}
                hintColor={getHintColor(activeContent.metaDescription.length, 160)}
              >
                <textarea
                  rows={3}
                  value={activeContent.metaDescription}
                  onChange={(e) => updateContent('metaDescription', e.target.value.slice(0, 160))}
                  placeholder="Google/AI Overview qısa təsviri..."
                  className="w-full rounded-xl border bg-transparent p-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)] resize-none"
                  style={inputStyle}
                />
              </Field>
            </div>
          </Card>

          {/* Blok 4 - Qiymət */}
          <Card>
            <CardHeader icon={DollarSign} title="Qiymət" subtitle="Məhsulun qiymət məlumatları" />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="Qiymət">
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="0.00"
                  className={inputClass} 
                  style={inputStyle} 
                />
              </Field>
              <Field label="Valyuta">
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className={inputClass} 
                  style={inputStyle}
                >
                  <option value="AZN">AZN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </Field>
              <Field label="Qiymət növü">
                <select 
                  value={priceType} 
                  onChange={(e) => setPriceType(e.target.value as PriceType)}
                  className={inputClass} 
                  style={inputStyle}
                >
                  <option value="Fixed">Sabit</option>
                  <option value="Starting from">Başlayan</option>
                  <option value="Contact us">Razılaşma ilə</option>
                </select>
              </Field>
            </div>
          </Card>

          {/* Blok 5 - Açar sözlər */}
          <Card>
            <CardHeader icon={Tag} title="Açar sözlər" subtitle="AI axtarış üçün vacibdir" />
            <div className="mt-4 space-y-3">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span 
                      key={t} 
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold select-none"
                      style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}
                    >
                      {t}
                      <button 
                        type="button" 
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-center">
                <input 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Açar söz əlavə et və Enter bas"
                  className={`${inputClass} flex-1`} 
                  style={inputStyle} 
                />
                <button
                  type="button"
                  onClick={handleSuggestKeywords}
                  disabled={!activeContent.description || activeContent.description.length < 50 || isLoadingKeywords}
                  className="inline-flex h-10 flex-shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {isLoadingKeywords ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <span>AI təklif</span>
                </button>
              </div>

              {keywordError && (
                <p className="text-xs text-red-500">{keywordError}</p>
              )}

              {aiKeywords.length > 0 && (
                <div className="rounded-xl border p-3 space-y-2"
                  style={{
                    borderColor: "color-mix(in oklab, var(--accent) 25%, transparent)",
                    backgroundColor: "color-mix(in oklab, var(--accent) 6%, transparent)",
                  }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold" style={{ color: "var(--accent)" }}>
                      AI təklif edir — seçin əlavə edin:
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const newKeywords = aiKeywords.filter(k => !tags.includes(k));
                        const canAdd = Math.min(newKeywords.length, 10 - tags.length);
                        setTags(prev => [...prev, ...newKeywords.slice(0, canAdd)]);
                        setAiKeywords([]);
                      }}
                      className="text-[11px] font-bold underline underline-offset-2 whitespace-nowrap cursor-pointer"
                      style={{ color: "var(--accent)" }}
                    >
                      Hamısını əlavə et
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiKeywords.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => {
                          if (!tags.includes(kw) && tags.length < 10) {
                            setTags(prev => [...prev, kw]);
                            setAiKeywords(prev => prev.filter(k => k !== kw));
                          }
                        }}
                        disabled={tags.includes(kw) || tags.length >= 10}
                        className="inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-semibold transition-all disabled:opacity-40 cursor-pointer"
                        style={{ borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)", color: "var(--accent)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--accent)";
                          e.currentTarget.style.color = "var(--accent-foreground)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "var(--accent)";
                        }}
                      >
                        + {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Blok 6 - Media */}
          <Card>
            <CardHeader icon={Upload} title="Media" subtitle="Şəkillər və sənədlər" />
            <div 
              onClick={() => document.getElementById("file-upload")?.click()}
              className="mt-4 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer hover:border-[var(--accent)] transition-colors" 
              style={{ borderColor: "var(--border)" }}
            >
              <input 
                id="file-upload" 
                type="file" 
                hidden 
                multiple 
                onChange={handleFileUpload} 
              />
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
                <Upload size={18} />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Faylları bura sürüşdürün və ya klikləyin</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP — max 100MB (Maks 5 fayl)</p>
              <SecondaryButton 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById("file-upload")?.click();
                }} 
                className="mt-3"
              >
                Fayl seç
              </SecondaryButton>
            </div>

            {/* Preview List */}
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-3">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-xl border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {f.file.type.startsWith("image") ? (
                        <img
                          src={f.preview}
                          alt="preview"
                          className="h-12 w-12 object-cover rounded-xl shadow-sm"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-[var(--badge-bg)] text-[var(--badge-fg)] flex items-center justify-center rounded-xl flex-shrink-0">
                          <FileText size={20} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--foreground)] truncate max-w-[200px]">
                          {f.file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {(f.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles(files.filter((item) => item.id !== f.id));
                      }}
                      className="p-1.5 hover:bg-background text-muted-foreground hover:text-foreground rounded-xl transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader icon={Phone} title="Əlaqə & Müraciət" 
              subtitle="Boş buraxılsa şirkət profili məlumatları işlənər" />
            
            {/* Company fallback hint */}
            {(companyPhone || companyEmail) && (
              <div className="mt-4 rounded-xl p-3 flex items-center gap-2"
                style={{ backgroundColor: "color-mix(in oklab, var(--accent) 6%, transparent)",
                         borderColor: "color-mix(in oklab, var(--accent) 20%, transparent)",
                         border: "1px solid" }}>
                <Info size={13} style={{ color: "var(--accent)" }} />
                <p className="text-xs" style={{ color: "var(--accent)" }}>
                  Boş buraxılsa şirkət profili məlumatları istifadə ediləcək: 
                  <strong> {companyPhone || companyEmail}</strong>
                </p>
                <a href="/dashboard/company" 
                   className="ml-auto text-xs font-semibold underline"
                   style={{ color: "var(--accent)" }}>
                  Profili düzəlt
                </a>
              </div>
            )}

            <div className="mt-4 space-y-4">
              {/* Telefon — placeholder company phone */}
              <Field label="Məhsula xüsusi telefon (optional)">
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={companyPhone || "+994 XX XXX XX XX"}
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>

              {/* WhatsApp */}
              <Field label="WhatsApp (optional)">
                <input
                  type="tel"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  placeholder={companyPhone || "+994 XX XXX XX XX"}
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>

              {/* Custom link */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Xüsusi link">
                  <input type="url" value={contactCustomUrl}
                    onChange={(e) => setContactCustomUrl(e.target.value)}
                    placeholder="https://..." className={inputClass} style={inputStyle} />
                </Field>
                <Field label="Link mətni">
                  <input type="text" value={contactCustomLabel}
                    onChange={(e) => setContactCustomLabel(e.target.value)}
                    placeholder="Sifariş ver" className={inputClass} style={inputStyle} />
                </Field>
              </div>

              {/* Leads toggle */}
              <div className="flex items-center justify-between pt-3 border-t"
                style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    Leads formu
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    Ziyarətçilər birbaşa müraciət göndərə bilsin
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLeadsEnabled(!leadsEnabled)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{ backgroundColor: leadsEnabled ? "var(--accent)" : "var(--muted)" }}>
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                    style={{ transform: leadsEnabled ? "translateX(24px)" : "translateX(4px)" }} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sağ tərəf - Sidebar */}
        <div className="space-y-5">
          <div className="lg:sticky lg:top-20 space-y-5">
            {/* GEO Hazırlığı Card */}
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[var(--foreground)]">GEO Hazırlığı</h3>
                <span className="text-xl font-black" style={{ color: "var(--accent)" }}>{geoScore.percentage}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--muted)" }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${geoScore.percentage}%`, backgroundColor: "var(--accent)" }} />
              </div>
              <ul className="mt-4 space-y-2">
                {geoScore.checks.map((c) => {
                  let displayLabel = "";
                  if (c.key === "words") displayLabel = `Təsvir 150+ söz (${c.label})`;
                  else if (c.key === "question") displayLabel = "Sual var (?)";
                  else if (c.key === "price") displayLabel = "Qiymət var";
                  else if (c.key === "keywords") displayLabel = "Açar söz var";
                  else if (c.key === "metaTitle") displayLabel = "Meta başlıq var";
                  else if (c.key === "image") displayLabel = "Şəkil var";
                  else if (c.key === "english") displayLabel = "İngilis dili";

                  return (
                    <li key={c.key} className="flex items-center gap-2 text-xs"
                      style={{ color: c.passed ? "var(--foreground)" : "var(--muted-foreground)" }}>
                      <CheckCircle2 size={14} style={{ color: c.passed ? "oklch(0.55 0.16 150)" : "var(--border)" }} />
                      {displayLabel}
                    </li>
                  );
                })}
              </ul>
            </Card>

            {/* [BLOK 7] — Dillər */}
            <Card>
              <CardHeader icon={Languages} title="Kontent dili" subtitle="Hər dildə ayrıca kontent yazın" />
              
              <div className="mt-4">
                {/* Dil tab-ları */}
                <div className="flex gap-1.5 p-1 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
                  {LANGUAGES.map((lang) => {
                    const localeKey = lang.code.toLowerCase();
                    const hasContent = contentByLocale[localeKey]?.name?.trim().length > 0 
                                    && contentByLocale[localeKey]?.description?.trim().length > 0;
                    const isActive = activeLocale === lang.code;

                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLocale(lang.code as Locale)}
                        className="flex-1 relative rounded-lg py-2 text-xs font-bold transition-all"
                        style={isActive
                          ? { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }
                          : { color: "var(--foreground)" }}
                      >
                        {lang.code}
                        {/* Kontent statusu göstəricisi */}
                        {!isActive && (
                          <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: hasContent ? "#10B981" : "var(--border)" }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Aktiv dil üçün status */}
                <div className="mt-3">
                  {activeLocale === "AZ" && (
                    <p className="text-[11px] text-muted-foreground">
                      Əsas dil — bütün sahələr Azərbaycan dilində doldurulmalıdır
                    </p>
                  )}

                  {activeLocale !== "AZ" && !contentByLocale[activeLocale.toLowerCase()]?.name && (
                    <>
                      {/* AZ kontenti varsa — tərcümə təklif et */}
                      {(contentByLocale.az?.description?.trim().length || 0) > 50 ? (
                        <div className="rounded-xl p-4 space-y-3 mt-2"
                          style={{
                            backgroundColor: "color-mix(in oklab, var(--accent) 6%, transparent)",
                            border: "1px solid color-mix(in oklab, var(--accent) 20%, transparent)"
                          }}>
                          <div className="flex items-start gap-2">
                            <Sparkles size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                            <div>
                              <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                                {activeLocale === "EN" ? "İngilis" : "Rus"} dilində kontent yoxdur
                              </p>
                              <p className="text-[11px] mt-1 text-muted-foreground">
                                Azərbaycan dilindəki kontenti AI ilə tərcümə edə bilərsiniz, yaxud əl ilə yaza bilərsiniz.
                              </p>
                            </div>
                          </div>
                          <PrimaryButton
                            type="button"
                            onClick={() => handleTranslateSingle(activeLocale.toLowerCase())}
                            disabled={isTranslating}
                            className="w-full"
                          >
                            {isTranslating ? (
                              <><Loader2 className="h-4 w-4 animate-spin" /> Tərcümə edilir...</>
                            ) : (
                              <><Sparkles size={14} /> AZ-dan {activeLocale}-ə tərcümə et</>
                            )}
                          </PrimaryButton>
                          <p className="text-[10px] text-center text-muted-foreground">
                            Tərcümədən sonra üzərində düzəliş edə bilərsiniz
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl p-3 mt-2" style={{ backgroundColor: "var(--muted)" }}>
                          <p className="text-xs text-muted-foreground text-center">
                            Əvvəlcə Azərbaycan dilində kontent yazın, sonra tərcümə edə bilərsiniz.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {activeLocale !== "AZ" && contentByLocale[activeLocale.toLowerCase()]?.name && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[11px] flex items-center gap-1" style={{ color: "oklch(0.55 0.16 150)" }}>
                        <CheckCircle2 size={12} />
                        {activeLocale === "EN" ? "İngilis" : "Rus"} dilində kontent mövcuddur — aşağıda redaktə edin
                      </p>
                      <button
                        type="button"
                        onClick={() => handleTranslateSingle(activeLocale.toLowerCase())}
                        disabled={isTranslating}
                        className="text-[11px] font-semibold underline underline-offset-2"
                        style={{ color: "var(--accent)" }}
                      >
                        Yenidən tərcümə et
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Submit Actions */}
            <div className="space-y-3">
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                  <X className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <PrimaryButton 
                type="submit" 
                disabled={!(contentByLocale.az?.name || '').trim() || !(contentByLocale.az?.description || '').trim() || !categoryId || isSubmitting}
                className="h-12 w-full flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {files.length > 0 ? "Fayllar yüklənir..." : "Yayımlanır..."}
                  </span>
                ) : (
                  "Məhsulu yayımla"
                )}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Success Banner */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 duration-500 z-50">
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none tracking-tight">
              Məhsul yayımlandı!
            </p>
            <p className="text-sm opacity-90 mt-1 font-medium">
              Ensiklopediyada görünür, AI axtarışa açıqdır.
            </p>
            <div className="flex flex-col gap-1 mt-1">
              <Link
                href="/dashboard/products"
                className="text-xs underline opacity-80 block"
              >
                Məhsullarıma bax →
              </Link>
              {createdSlug && (
                <Link
                  href={`/products/${createdSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline opacity-80 block"
                >
                  Ensiklopediyada bax →
                </Link>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="ml-4 p-1 hover:bg-white/10 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </form>
  );
}
