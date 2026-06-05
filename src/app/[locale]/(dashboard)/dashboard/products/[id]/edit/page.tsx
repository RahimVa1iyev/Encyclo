"use client";
import { getSession } from "next-auth/react";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  X,
  Upload,
  Loader2,
  CheckCircle2,
  Languages,
  FileImage,
  FileText,
  Tag,
  CreditCard,
  Layout,
  ArrowLeft,
  ExternalLink,
  Search,
  Sparkles,
  Zap,
  Info,
  Phone,
} from "lucide-react";
import type { Category, Company } from "@/types";
import { toast } from "sonner";

// shadcn UI imports
import { Card, CardHeader, Field, PrimaryButton, SecondaryButton, inputClass, inputStyle, getHintColor } from "@/components/dashboard-ui";

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

interface ProductTranslationInput {
  locale: string;
  name?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  features?: {
    keywords?: string[];
    price?: number;
    currency?: string;
    price_type?: string;
    category_id?: string;
  };
}

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "AZ", label: "Azərbaycan" },
  { code: "EN", label: "English" },
  { code: "RU", label: "Русский" },
];

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);
  const [optimizedText, setOptimizedText] = useState<string | null>(null);
  const [showOptimized, setShowOptimized] = useState(false);

  // Form State
  const [type, setType] = useState<ProductType>("product");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("AZN");
  const [priceType, setPriceType] = useState<PriceType>("Fixed");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<
    { file: File; preview: string; id: string }[]
  >([]);
  const [productSlug, setProductSlug] = useState<string>("");
  const [productStatus, setProductStatus] = useState<string>("draft");

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

  // Contact States
  const [contactWebsite, setContactWebsite] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactWhatsapp, setContactWhatsapp] = useState<string>("");
  const [contactCustomUrl, setContactCustomUrl] = useState<string>("");
  const [contactCustomLabel, setContactCustomLabel] = useState<string>("");
  const [leadsEnabled, setLeadsEnabled] = useState<boolean>(false);


  const geoScore = useMemo(() => {
    const azContent = contentByLocale.az || contentByLocale.AZ || { name: "", description: "", metaTitle: "", metaDescription: "" };
    
    const wordCount = (azContent.description || '').trim().split(/\s+/).filter(Boolean).length;
    const questionCount = (azContent.description || '').split('\n').filter((line: any) => line.trim().endsWith('?')).length;
    const hasQuestion = questionCount >= 3;
    const hasPrice = price.length > 0;
    const hasKeywords = tags.length > 0;
    const hasMinWords = wordCount >= 150;
    const hasMetaTitle = (azContent.metaTitle || '').length >= 10;
    const hasImage = existingImages.length > 0 || newFiles.length > 0;
    
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

    const passedCount = checks.filter((c: any) => c.passed).length;
    const percentage = Math.round((passedCount / checks.length) * 100);
    return { checks, percentage, passedCount, total: checks.length };
  }, [contentByLocale, price, tags, existingImages, newFiles]);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      const user = session?.user;
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { getEditProductPageData } = await import('@/app/[locale]/(dashboard)/actions');
      const data = await getEditProductPageData(productId);

      if (!data) {
        toast.error("Məhsul tapılmadı və ya giriş icazəniz yoxdur");
        window.location.href = "/dashboard/products";
        return;
      }

      setCompany(data.company as unknown as Company);
      setCategories(data.categories as unknown as Category[]);

      const product = data.product;
      const companyTranslation = data.company.translations?.[0];

      const companyName = companyTranslation?.name || '';
      setCompanyName(companyName);
      setCompanyPhone(data.company.phone || "");
      setCompanyEmail(data.company.email || "");

      // Pre-fill fields
      setType((product.type as "product" | "service") || "product");
      setProductSlug(product.slug || "");
      setProductStatus(product.status || "draft");
      setCategoryId(product.category_id || "");
      setExistingImages(product.images || []);

      setContactWebsite((product.contact_options as any)?.website || "");
      setContactPhone((product.contact_options as any)?.phone || "");
      setContactWhatsapp((product.contact_options as any)?.whatsapp || "");
      setContactCustomUrl((product.contact_options as any)?.custom_url || "");
      setContactCustomLabel((product.contact_options as any)?.custom_label || "");
      setLeadsEnabled(product.leads_enabled === true);

      const contentMap: Record<string, LocaleContent> = {};

      product.translations?.forEach((t: any) => {
        contentMap[t.locale] = {
          name: t.name || "",
          description: t.description || "",
          metaTitle: t.meta_title || "",
          metaDescription: t.meta_description || "",
        }
      });

      if (!contentMap.az) {
        contentMap.az = { name: "", description: "", metaTitle: "", metaDescription: "" }
      }

      setContentByLocale(contentMap);
      setActiveLocale("AZ");

      const azTranslation = product.translations?.find(
        (t: any) => t.locale === "az"
      );
      if (azTranslation) {
        const features = (azTranslation.features as any) || {};

        // Fallback for category_id from features if not in products table
        if (!product.category_id && features.category_id) {
          setCategoryId(features.category_id);
        }

        setPrice(
          features.price !== null && features.price !== undefined
            ? String(features.price)
            : ""
        );
        setCurrency(features.currency || "AZN");
        setPriceType((features.price_type as PriceType) || "Fixed");
        setTags(features.keywords || []);
      }

      setIsLoading(false);
    }
    init();
  }, [productId]);

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

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();

    const value = tagInput.trim().replace(/,$/, "");
    if (value && !tags.includes(value) && tags.length < 10) {
      setTags([...tags, value]);
      setTagInput("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesToAdd = Array.from(e.target.files || []);
    if (existingImages.length + newFiles.length + filesToAdd.length > 5) {
      toast.error("Maksimum 5 fayl əlavə edə bilərsiniz");
      return;
    }

    filesToAdd.forEach((file: any) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Şəkil ölçüsü 5MB-dan böyük ola bilməz');
        return;
      }
      const preview = URL.createObjectURL(file);
      setNewFiles((prev) => [
        ...prev,
        { file, preview, id: Math.random().toString(36).substr(2, 9) },
      ]);
    });
  };

  const removeExistingImage = (url: string) => {
    setExistingImages(existingImages.filter((img: any) => img !== url));
  };



  const handleOptimize = async () => {
    if (!activeContent.description || activeContent.description.length < 50) return;
    setIsOptimizing(true);
    setOptimizeError(null);
    setOptimizedText(null);

    // Get category name from categories array
    const selectedCategory = categories.find((c: any) => c.id === categoryId);
    const categoryName = selectedCategory?.name || '';

    try {
      const res = await fetch('/api/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: activeContent.description,
          name: activeContent.name,
          category: categoryName,
          price,
          currency,
          priceType,
          tags,
          companyName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xəta baş verdi');
      setOptimizedText(data.optimizedText);
      setShowOptimized(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Optimallaşdırma xətası';
      setOptimizeError(message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const azContent = contentByLocale.az || contentByLocale.AZ || { name: "", description: "" };
    if (!(azContent.name || '').trim() || !(azContent.description || '').trim() || !categoryId || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload new media files in parallel
      const uploadPromises = newFiles.map(async (item) => {
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
      const newUploadedUrls = await Promise.all(uploadPromises);

      const finalImages = [...existingImages, ...newUploadedUrls];

      // 2. Prepare Data for Update
      const productUpdateData = {
        type,
        category_id: categoryId,
        images: finalImages,
        contact_options: {
          ...(contactWebsite.trim() && { website: contactWebsite.trim() }),
          ...(contactPhone.trim() && { phone: contactPhone.trim() }),
          ...(contactWhatsapp.trim() && { whatsapp: contactWhatsapp.trim() }),
          ...(contactCustomUrl.trim() && { custom_url: contactCustomUrl.trim() }),
          ...(contactCustomLabel.trim() && { custom_label: contactCustomLabel.trim() }),
        },
        leads_enabled: leadsEnabled,
      };

      // 3. Prepare translations
      const validLocales = Object.entries(contentByLocale)
        .filter(([_, content]) => content.name.trim().length > 0)
        .map(([locale]) => locale);

      const translationsToSave = validLocales.map((locale: any) => {
        const content = contentByLocale[locale];
        return {
          locale: locale,
          name: content.name,
          description: content.description,
          meta_title: content.metaTitle || content.name,
          meta_description: content.metaDescription || content.description.slice(0, 160),
          features: {
            keywords: content.keywords || tags,
            price: price ? parseFloat(price) : undefined,
            currency,
            price_type: priceType,
            category_id: categoryId,
          },
        };
      });

      const { updateFullProductAction } = await import('@/app/[locale]/(dashboard)/actions');
      await updateFullProductAction(productId, productUpdateData, translationsToSave);

      if (!contentByLocale.en?.name) {
        toast.info("💡 İngilis dilində kontent əlavə etsəniz, GEO Score +20 bal artacaq.", {
          duration: 5000,
        })
      }

      toast.success("Məhsul yeniləndi");
      window.location.href = "/dashboard/products";
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Xəta baş verdi. Yenidən cəhd edin.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="space-y-5 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <a
            href="/dashboard/products"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--foreground)] transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Məhsullarıma qayıt
          </a>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Məhsulu redaktə et</h2>
          <p className="mt-1 text-sm text-muted-foreground">Məhsul və ya xidmət məlumatlarını yeniləyin</p>
        </div>
        <div className="flex gap-2 items-center">
          {productSlug && productStatus === "active" && (
            <a
              href={`/products/${productSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors flex-shrink-0"
              style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}
            >
              <ExternalLink className="h-4 w-4" />
              Ensiklopediyada bax
            </a>
          )}
          {productSlug && productStatus === "draft" && (
            <span className="inline-flex items-center text-xs text-muted-foreground bg-[var(--muted)] border px-3 py-2 rounded-xl select-none flex-shrink-0"
              style={{ borderColor: "var(--border)" }}>
              Qaralama — ensiklopediyada görünmür
            </span>
          )}
        </div>
      </div>

      <form id="edit-product-form" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            
            {/* [BLOK 1] — Əsas məlumatlar */}
            <Card>
              <CardHeader icon={Layout} title="Əsas məlumatlar" subtitle="Məhsulun adı və kateqoriyası" />
              <div className="mt-4 space-y-4">
                <Field label="Məzmun Növü">
                  <div className="flex p-1 bg-[var(--muted)] border rounded-xl w-fit gap-1" style={{ borderColor: "var(--border)" }}>
                    {["product", "service"].map((t: any) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t as ProductType)}
                        className="px-5 py-2 text-sm font-medium rounded-lg transition-all capitalize"
                        style={type === t 
                          ? { backgroundColor: "var(--accent)", color: "var(--accent-foreground)", borderColor: "var(--accent)" }
                          : { borderColor: "var(--border)", color: "var(--foreground)" }}
                      >
                        {t === "product" ? "Məhsul" : "Xidmət"}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Ad" hint={`${activeContent.name.length} / 100`} hintColor={getHintColor(activeContent.name.length, 100)}>
                  <input
                    id="name"
                    required
                    value={activeContent.name}
                    onChange={(e) => updateContent('name', e.target.value.slice(0, 100))}
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
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </Card>

            {/* [BLOK 2] — Məzmun */}
            <Card>
              <CardHeader icon={FileText} title="Məzmun" subtitle="Ətraflı təsvir AI axtarışa birbaşa təsir edir" />
              <div className="mt-4 space-y-5">
                {activeLocale !== "AZ" && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
                      {activeLocale}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      dilində yazırsınız
                    </span>
                  </div>
                )}
                <Field label="Təsvir" hint={`${activeContent.description.length} / 3000`} hintColor={getHintColor(activeContent.description.length, 3000)}>
                  <textarea
                    required
                    rows={6}
                    value={activeContent.description}
                    onChange={(e) => updateContent('description', e.target.value.slice(0, 3000))}
                    className="w-full rounded-xl border bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)] resize-none"
                    style={inputStyle}
                  />
                </Field>

                {/* AI Optimize Section */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl space-y-3"
                    style={{
                      backgroundColor: "color-mix(in oklab, var(--accent) 6%, transparent)",
                      border: "1px solid color-mix(in oklab, var(--accent) 25%, transparent)"
                    }}>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: "var(--badge-bg)" }}>
                        <Sparkles className="h-4 w-4" style={{ color: "var(--accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                          AI ilə optimallaşdır
                        </p>
                        <p className="text-xs mt-0.5 leading-relaxed text-muted-foreground">
                          Kateqoriya analizi + məhsul məlumatları əsasında
                          description-ı GEO formatına çevirir
                        </p>
                        {/* Show what context will be used */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {categoryId && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface border"
                              style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
                              {categories.find((c: any) => c.id === categoryId)?.name}
                            </span>
                          )}
                          {price && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface border"
                              style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
                              {price} {currency}
                            </span>
                          )}
                          {tags.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface border"
                              style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
                              {tags.length} açar söz
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOptimize}
                      disabled={!activeContent.description || activeContent.description.length < 50 || isOptimizing}
                      className="w-full py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
                    >
                      {isOptimizing ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Analiz edilir və yazılır...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Optimallaşdır</>
                      )}
                    </button>
                  </div>

                  {optimizeError && (
                    <p className="text-xs text-red-500">{optimizeError}</p>
                  )}

                  {optimizedText && showOptimized && (
                    <div className="p-4 bg-surface border rounded-xl space-y-3 shadow-sm" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
                          <Zap className="h-3.5 w-3.5" />
                          GEO-optimallaşdırılmış məzmun hazırdır
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowOptimized(false)}
                          className="text-muted-foreground hover:text-[var(--foreground)] transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {optimizedText
                          .split(/\n{2,}/)
                          .filter((block: any) => block.trim())
                          .map((block: any, i: any) => {
                            const lines = block.trim().split('\n').filter((l: any) => l.trim())
                            if (lines.length === 0) return null
                            const firstLine = lines[0].trim()
                            const isQuestion = firstLine.endsWith('?')
                            return (
                              <div key={i} className="space-y-0.5">
                                {isQuestion && (
                                  <p className="text-xs font-bold" style={{ color: "var(--accent)" }}>{firstLine}</p>
                                )}
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                  {isQuestion ? lines.slice(1).join(' ') : firstLine}
                                </p>
                              </div>
                            )
                          })}
                      </div>
                      <div className="flex gap-2 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
                        <SecondaryButton type="button" onClick={() => { setShowOptimized(false); setOptimizedText(null) }} className="flex-1">
                          Ləğv et
                        </SecondaryButton>
                        <PrimaryButton type="button" onClick={() => {
                            updateContent('description', optimizedText); setShowOptimized(false); setOptimizedText(null);
                          }} className="flex-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Tətbiq et
                        </PrimaryButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* [BLOK 3] — SEO məlumatları */}
            <Card>
              <CardHeader icon={Search} title="SEO məlumatları" subtitle="AI axtarış sistemlərində görünmə üçün vacibdir" />
              <div className="mt-4 grid gap-5">
                <Field label="Meta Başlıq" hint={`${activeContent.metaTitle.length} / 60`} hintColor={getHintColor(activeContent.metaTitle.length, 60)}>
                  <input
                    value={activeContent.metaTitle}
                    onChange={(e) => updateContent('metaTitle', e.target.value.slice(0, 60))}
                    placeholder="ChatGPT-də axtarışda görünəcək başlıq..."
                    className={inputClass}
                    style={inputStyle}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">Boş buraxılsa məhsul adından avtomatik yaranır</p>
                </Field>
                <Field label="Meta Təsvir" hint={`${activeContent.metaDescription.length} / 160`} hintColor={getHintColor(activeContent.metaDescription.length, 160)}>
                  <textarea
                    rows={3}
                    value={activeContent.metaDescription}
                    onChange={(e) => updateContent('metaDescription', e.target.value.slice(0, 160))}
                    placeholder="Axtarış nəticəsində məhsul altında görünəcək qısa təsvir..."
                    className="w-full rounded-xl border bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)] resize-none"
                    style={inputStyle}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">Boş buraxılsa əsas təsvirin ilk 160 simvolu istifadə edilir</p>
                </Field>
              </div>
            </Card>

            {/* [BLOK 4] — Qiymət */}
            <Card>
              <CardHeader icon={CreditCard} title="Qiymət" subtitle="&apos;X AZN-ə CRM&apos; axtarışlarında üst sıraya çıxarır" />
              <div className="mt-4 space-y-4">
                <div className="flex h-11 rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-[var(--accent)] bg-surface" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-center w-12 bg-[var(--muted)] border-r text-sm font-medium text-muted-foreground shrink-0 select-none" style={{ borderColor: "var(--border)" }}>
                    {currency === "AZN" ? "₼" : currency === "USD" ? "$" : "€"}
                  </div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-3 text-sm bg-transparent outline-none text-[var(--foreground)]"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-3 text-sm font-medium bg-[var(--muted)] border-l outline-none cursor-pointer text-[var(--foreground)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <option value="AZN">AZN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <Field label="Qiymət növü">
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {["Fixed", "Starting from", "Contact us"].map((pt: any) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setPriceType(pt as PriceType)}
                        className="px-4 py-2.5 text-xs font-medium rounded-xl border transition-all min-w-[130px]"
                        style={priceType === pt 
                          ? { backgroundColor: "var(--accent)", color: "var(--accent-foreground)", borderColor: "var(--accent)" }
                          : { backgroundColor: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      >
                        <div className="font-bold text-center">
                          {pt === "Fixed" ? "Sabit" : pt === "Starting from" ? "Başlayan" : "Əlaqə saxla"}
                        </div>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </Card>

            {/* [BLOK 5] — Media */}
            <Card>
              <CardHeader icon={FileImage} title="Media" subtitle="Şəkillər məhsul səhifəsində göstəriləcək" />
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Existing Images */}
                {existingImages.map((url: any, idx: any) => (
                  <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border group" style={{ borderColor: "var(--border)" }}>
                    <img src={url} className="w-full h-full object-cover" alt={`Existing ${idx}`} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* New Files */}
                {newFiles.map((f: any) => (
                  <div key={f.id} className="relative aspect-square rounded-2xl overflow-hidden border border-dashed group" style={{ borderColor: "var(--accent)" }}>
                    {f.file.type.startsWith("image") ? (
                      <img src={f.preview} className="w-full h-full object-cover" alt="New" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--badge-bg)] text-[var(--accent)] font-bold">
                        Fayl
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setNewFiles(newFiles.filter((item: any) => item.id !== f.id))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                {existingImages.length + newFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all text-muted-foreground hover:text-[var(--accent)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Upload className="h-8 w-8 mb-2" />
                    <span className="text-xs font-semibold">Fayl əlavə et</span>
                    <input id="file-upload" type="file" hidden multiple onChange={handleFileUpload} />
                  </button>
                )}
              </div>
            </Card>

            {/* [BLOK 6] — Əlaqə & Müraciət */}
            <Card>
              <CardHeader icon={Phone} title="Əlaqə & Müraciət" subtitle="Ziyarətçilər məhsul səhifəsindən necə əlaqə qursun?" />
              <div className="mt-4 space-y-4">
                {(companyPhone || companyEmail) && !contactPhone && (
                  <div className="mb-4 rounded-xl p-3 flex items-center gap-2"
                    style={{ backgroundColor: "color-mix(in oklab, var(--accent) 6%, transparent)",
                             border: "1px solid color-mix(in oklab, var(--accent) 20%, transparent)" }}>
                    <Info size={13} style={{ color: "var(--accent)" }} />
                    <p className="text-xs" style={{ color: "var(--accent)" }}>
                      İndi şirkət profil məlumatları istifadə edilir: <strong>{companyPhone}</strong>
                    </p>
                  </div>
                )}
                <Field label="Vebsayt / Məhsul linki">
                  <input type="url" placeholder={company?.website || "https://..."} value={contactWebsite} onChange={(e) => setContactWebsite(e.target.value)} className={inputClass} style={inputStyle} />
                </Field>
                <Field label="Telefon">
                  <input type="tel" placeholder={companyPhone || "+994 XX XXX XX XX"} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} style={inputStyle} />
                </Field>
                <Field label="WhatsApp">
                  <input type="tel" placeholder={companyPhone || "+994 XX XXX XX XX"} value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} className={inputClass} style={inputStyle} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Xüsusi link">
                    <input type="url" placeholder="https://..." value={contactCustomUrl} onChange={(e) => setContactCustomUrl(e.target.value)} className={inputClass} style={inputStyle} />
                  </Field>
                  <Field label="Link mətni">
                    <input type="text" placeholder="Sifariş ver" value={contactCustomLabel} onChange={(e) => setContactCustomLabel(e.target.value)} className={inputClass} style={inputStyle} />
                  </Field>
                </div>
                <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-[var(--foreground)]">Leads formu</p>
                      <p className="text-xs text-muted-foreground">Ziyarətçilər birbaşa məhsul səhifəsindən müraciət göndərə bilsin</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLeadsEnabled(!leadsEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                      style={{ backgroundColor: leadsEnabled ? "var(--accent)" : "var(--muted)" }}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${leadsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

          </div>

          <div className="space-y-5">
            <div className="lg:sticky lg:top-20 space-y-5">
              
              {/* GEO Score */}
              <Card>
                <CardHeader icon={Zap} title="GEO Score" subtitle="AI görünürlüyü göstəricisi" right={
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md text-xs font-bold"
                    style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
                    {geoScore.percentage}%
                  </div>
                } />
                <div className="mt-4 space-y-4">
                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                    <div className="h-full transition-all duration-500"
                      style={{
                        width: `${geoScore.percentage}%`,
                        backgroundColor: geoScore.percentage >= 80 ? "oklch(0.6 0.15 150)" : geoScore.percentage >= 50 ? "oklch(0.7 0.15 60)" : "oklch(0.6 0.15 25)"
                      }} />
                  </div>
                  
                  <div className="space-y-2.5">
                    {geoScore.checks.map((c: any) => (
                      <div key={c.key} className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex-shrink-0">
                          {c.passed ? (
                            <CheckCircle2 size={14} style={{ color: "oklch(0.6 0.15 150)" }} />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: "var(--border)" }} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[var(--foreground)]">{c.label}</p>
                          {!c.passed && <p className="text-[10px] text-muted-foreground mt-0.5">{c.tip}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* [BLOK 7] — Dillər */}
              <Card>
                <CardHeader icon={Languages} title="Kontent dili" subtitle="Hər dildə ayrıca kontent yazın" />
                
                <div className="mt-4">
                  {/* Dil tab-ları */}
                  <div className="flex gap-1.5 p-1 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
                    {LANGUAGES.map((lang: any) => {
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

              {/* [BLOK 8] — Açar sözlər */}
              <Card>
                <CardHeader icon={Tag} title="Açar sözlər" subtitle="Axtarış sorğularını hədəfləyir" />
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2 min-h-[28px]">
                    {tags.map((tag: any) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg"
                        style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}
                      >
                        #{tag}
                        <button type="button" onClick={() => setTags(tags.filter((t: any) => t !== tag))}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="məsələn: CRM... (Enter ilə əlavə edin)"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </Card>

              {/* Submit */}
              <div className="space-y-3">
                {error && (
                  <div className="w-full text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
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
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saxlanılır...</>
                  ) : (
                    "Dəyişiklikləri saxla"
                  )}
                </PrimaryButton>
              </div>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
}