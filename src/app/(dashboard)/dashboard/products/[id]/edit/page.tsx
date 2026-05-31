"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProductType = "product" | "service";
type PriceType = "Fixed" | "Starting from" | "Contact us";
type Locale = "AZ" | "EN" | "RU";

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
  const supabase = useMemo(() => createClient(), []);
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
  const [translationResult, setTranslationResult] = useState<Record<
    string,
    { name: string; description: string }
  > | null>(null);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);
  const [optimizedText, setOptimizedText] = useState<string | null>(null);
  const [showOptimized, setShowOptimized] = useState(false);

  // Form State
  const [type, setType] = useState<ProductType>("product");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("AZN");
  const [priceType, setPriceType] = useState<PriceType>("Fixed");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<
    { file: File; preview: string; id: string }[]
  >([]);
  const [selectedLanguages, setSelectedLanguages] = useState<Locale[]>(["AZ"]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [productSlug, setProductSlug] = useState<string>("");
  const [productStatus, setProductStatus] = useState<string>("draft");

  // Contact States
  const [contactWebsite, setContactWebsite] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactWhatsapp, setContactWhatsapp] = useState<string>("");
  const [contactCustomUrl, setContactCustomUrl] = useState<string>("");
  const [contactCustomLabel, setContactCustomLabel] = useState<string>("");
  const [leadsEnabled, setLeadsEnabled] = useState<boolean>(false);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      // 1. Fetch Company and Categories in parallel
      const [compResult, catResult] = await Promise.all([
        supabase
          .from("companies")
          .select("id, owner_id, phone, email, website")
          .eq("owner_id", user.id)
          .single(),
        supabase.from("categories").select("*").order("name"),
      ]);

      const compData = compResult.data;
      const catData = catResult.data;

      if (!compData) {
        window.location.href = "/dashboard";
        return;
      }
      setCompany(compData as unknown as Company);
      if (catData) setCategories(catData);

      // 2. Fetch Product & Translations
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*, translations:product_translations(*)")
        .eq("id", productId)
        .single();

      if (productError || !product || product.company_id !== compData.id) {
        toast.error("Məhsul tapılmadı və ya giriş icazəniz yoxdur");
        window.location.href = "/dashboard/products";
        return;
      }

      // Already have compData.id — fetch company translation
      const { data: companyTranslation } = await supabase
        .from('company_translations')
        .select('name')
        .eq('company_id', compData.id)
        .eq('locale', 'az')
        .single();

      const companyName = companyTranslation?.name || '';
      setCompanyName(companyName);
      setCompanyPhone(compData.phone || "");
      setCompanyEmail(compData.email || "");

      // Pre-fill fields
      setType(product.type || "product");
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

      const azTranslation = product.translations?.find(
        (t: ProductTranslationInput) => t.locale === "az"
      );
      if (azTranslation) {
        setName(azTranslation.name || "");
        setDescription(azTranslation.description || "");
        setMetaTitle(azTranslation.meta_title || "");
        setMetaDescription(azTranslation.meta_description || "");
        const features = azTranslation.features || {};

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

      const locales =
        product.translations?.map((t: ProductTranslationInput) =>
          t.locale.toUpperCase() as Locale
        ) || ["AZ"];
      setSelectedLanguages(locales);

      setIsLoading(false);
    }
    init();
  }, [productId, supabase]);

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

    filesToAdd.forEach((file) => {
      if (file.size > 100 * 1024 * 1024) return;
      const preview = URL.createObjectURL(file);
      setNewFiles((prev) => [
        ...prev,
        { file, preview, id: Math.random().toString(36).substr(2, 9) },
      ]);
    });
  };

  const removeExistingImage = (url: string) => {
    setExistingImages(existingImages.filter((img) => img !== url));
  };

  const handleTranslate = async () => {
    if (!name || !description) return;
    setIsTranslating(true);
    setTranslationError(null);
    try {
      const targetLocales = selectedLanguages
        .map((l) => l.toLowerCase())
        .filter((l) => l !== "az");
      const res = await fetch("/api/ai-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, targetLocales }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xəta baş verdi");
      setTranslationResult(data.translations);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Tərcümə xətası";
      setTranslationError(message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleOptimize = async () => {
    if (!description || description.length < 50) return;
    setIsOptimizing(true);
    setOptimizeError(null);
    setOptimizedText(null);

    // Get category name from categories array
    const selectedCategory = categories.find(c => c.id === categoryId);
    const categoryName = selectedCategory?.name || '';

    try {
      const res = await fetch('/api/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          name,
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
    if (!name || !description || !categoryId || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload new media files in parallel
      const uploadPromises = newFiles.map(async (item) => {
        const fileExt = item.file.name.split(".").pop();
        const fileName = `${company?.id}-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, item.file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(filePath);
        return publicUrl;
      });
      const newUploadedUrls = await Promise.all(uploadPromises);

      const finalImages = [...existingImages, ...newUploadedUrls];

      // 2. Update Product
      const { error: productError } = await supabase
        .from("products")
        .update({
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
        })
        .eq("id", productId);

      if (productError) throw productError;

      // 3. Delete deleted locales and Upsert remaining Translations
      const localesToKeep = selectedLanguages.map((l) => l.toLowerCase());

      const { data: existingTranslations } = await supabase
        .from("product_translations")
        .select("locale")
        .eq("product_id", productId);

      if (existingTranslations) {
        const toDelete = existingTranslations
          .map((t) => t.locale)
          .filter((locale) => !localesToKeep.includes(locale));

        if (toDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from("product_translations")
            .delete()
            .eq("product_id", productId)
            .in("locale", toDelete);
          if (deleteError) throw deleteError;
        }
      }

      // Sonra upsert
      for (const locale of selectedLanguages) {
        const localeKey = locale.toLowerCase();
        const translated = translationResult?.[localeKey];
        const { error: transError } = await supabase
          .from("product_translations")
          .upsert(
            {
              product_id: productId,
              locale: localeKey,
              name: translated?.name || name,
              description: translated?.description || description,
              meta_title: metaTitle || translated?.name || name,
              meta_description:
                metaDescription ||
                (translated?.description || description).slice(0, 160),
              features: {
                keywords: tags,
                price: price ? parseFloat(price) : undefined,
                currency,
                price_type: priceType,
                category_id: categoryId,
              },
            },
            { onConflict: "product_id,locale" }
          );
        if (transError) throw transError;
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
      <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded-xl" />
            <div className="h-4 w-48 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-9 w-36 bg-gray-100 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border p-10 space-y-8">
          <div className="h-10 w-48 bg-gray-100 rounded-xl" />
          <div className="h-px w-full bg-gray-100" />
          <div className="space-y-4">
            <div className="h-11 w-full bg-gray-100 rounded-xl" />
            <div className="h-11 w-full bg-gray-100 rounded-xl" />
            <div className="h-32 w-full bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <a
            href="/dashboard/products"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Məhsullarıma qayıt
          </a>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Məhsulu Redaktə Et
          </h1>
          <p className="text-muted-foreground">
            Məhsul və ya xidmət məlumatlarını yeniləyin.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {productSlug && productStatus === "active" && (
            <a
              href={`/products/${productSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              Ensiklopediyada bax
            </a>
          )}
          {productSlug && productStatus === "draft" && (
            <span className="inline-flex items-center text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl select-none flex-shrink-0">
              Qaralama — ensiklopediyada görünmür
            </span>
          )}
        </div>
      </div>

      <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-4">
        {/* [BLOK 1] — Əsas məlumatlar */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Layout className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-950">
                  Əsas məlumatlar
                </CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Məhsulun adı və kateqoriyası
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Məzmun Növü
                </Label>
                <div className="flex p-1 bg-gray-50 border border-gray-200 rounded-xl w-fit gap-1">
                  {["product", "service"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t as ProductType)}
                      className={cn(
                        "px-5 py-2 text-sm font-medium rounded-lg transition-all capitalize",
                        type === t
                          ? "bg-white text-indigo-600 shadow-sm border border-gray-200"
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      {t === "product" ? "Məhsul" : "Xidmət"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Ad</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 px-4 text-sm rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Kateqoriya</Label>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  required
                >
                  <SelectTrigger className="h-11 px-4 text-sm rounded-xl">
                    <SelectValue placeholder="Kateqoriya seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* [BLOK 2] — Məzmun */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-950">
                  Məzmun
                </CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ətraflı təsvir AI axtarışa birbaşa təsir edir
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label>Təsvir</Label>
              <Textarea
                required
                rows={6}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value.slice(0, 3000));
                  if (translationResult) setTranslationResult(null);
                }}
                className="px-4 py-3 text-sm rounded-xl resize-none"
              />
              <div className="text-right text-xs text-muted-foreground">
                {description.length} / 3000
              </div>

              {/* AI Optimize Section */}
              <div className="space-y-3">
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center
                                    justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-indigo-900">
                        AI ilə optimallaşdır
                      </p>
                      <p className="text-xs text-indigo-600 mt-0.5 leading-relaxed">
                        Kateqoriya analizi + məhsul məlumatları əsasında
                        description-ı GEO formatına çevirir
                      </p>
                      {/* Show what context will be used */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {categoryId && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md
                                         text-[10px] font-medium bg-white border border-indigo-200
                                         text-indigo-700">
                            {categories.find(c => c.id === categoryId)?.name}
                          </span>
                        )}
                        {price && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md
                                         text-[10px] font-medium bg-white border border-indigo-200
                                         text-indigo-700">
                            {price} {currency}
                          </span>
                        )}
                        {tags.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md
                                         text-[10px] font-medium bg-white border border-indigo-200
                                         text-indigo-700">
                            {tags.length} açar söz
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOptimize}
                    disabled={!description || description.length < 50 || isOptimizing}
                    className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600
                               hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                               rounded-xl transition-colors flex items-center justify-center gap-2"
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
                  <div className="p-4 bg-white border border-indigo-200 rounded-xl space-y-3
                                  shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        GEO-optimallaşdırılmış məzmun hazırdır
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowOptimized(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {optimizedText
                        .split(/\n{2,}/)
                        .filter(block => block.trim())
                        .map((block, i) => {
                          const lines = block.trim().split('\n').filter(l => l.trim())
                          if (lines.length === 0) return null
                          const firstLine = lines[0].trim()
                          const isQuestion = firstLine.endsWith('?')
                          return (
                            <div key={i} className="space-y-0.5">
                              {isQuestion && (
                                <p className="text-xs font-bold text-indigo-700">{firstLine}</p>
                              )}
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {isQuestion ? lines.slice(1).join(' ') : firstLine}
                              </p>
                            </div>
                          )
                        })}
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptimized(false)
                          setOptimizedText(null)
                        }}
                        className="flex-1 py-2 text-xs font-medium text-gray-500
                                   bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Ləğv et
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDescription(optimizedText)
                          setShowOptimized(false)
                          setOptimizedText(null)
                          if (translationResult) setTranslationResult(null)
                        }}
                        className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600
                                   hover:bg-indigo-500 rounded-lg transition-colors
                                   flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Tətbiq et
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* [BLOK 3] — SEO məlumatları */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Search className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-955">
                  SEO məlumatları
                </CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  AI axtarış sistemlərində görünmə üçün vacibdir
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid gap-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-600">Meta Başlıq</Label>
                  <span className="text-[11px] text-gray-400">
                    {metaTitle.length} / 60
                  </span>
                </div>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))}
                  placeholder="ChatGPT-də axtarışda görünəcək başlıq..."
                  className="h-11 px-4 text-sm rounded-xl"
                />
                <p className="text-[11px] text-gray-400">
                  Boş buraxılsa məhsul adından avtomatik yaranır
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-600">Meta Təsvir</Label>
                  <span className="text-[11px] text-gray-400">
                    {metaDescription.length} / 160
                  </span>
                </div>
                <Textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) =>
                    setMetaDescription(e.target.value.slice(0, 160))
                  }
                  placeholder="Axtarış nəticəsində məhsun altında görünəcək qısa təsvir..."
                  className="px-4 py-3 text-sm rounded-xl resize-none"
                />
                <p className="text-[11px] text-gray-400">
                  Boş buraxılsa əsas təsvirin ilk 160 simvolu istifadə edilir
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* [BLOK 4] — Qiymət */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-955">
                  Qiymət
                </CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  &apos;X AZN-ə CRM&apos; axtarışlarında üst sıraya çıxarır
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex h-11 rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-white">
              <div className="flex items-center justify-center w-12 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-500 shrink-0 select-none">
                {currency === "AZN"
                  ? "₼"
                  : currency === "USD"
                    ? "$"
                    : "€"}
              </div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="flex-1 px-3 text-sm bg-transparent outline-none"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 text-sm font-medium bg-gray-50 border-l border-gray-200 outline-none cursor-pointer"
              >
                <option value="AZN">AZN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-600 text-xs font-semibold">
                Qiymət növü
              </Label>
              <div className="flex flex-wrap gap-2">
                {["Fixed", "Starting from", "Contact us"].map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPriceType(pt as PriceType)}
                    className={cn(
                      "px-4 py-2.5 text-xs font-medium rounded-xl border transition-all min-w-[130px]",
                      priceType === pt
                        ? "bg-white border-indigo-200 text-indigo-600 shadow-sm"
                        : "bg-gray-50 border-gray-100 text-gray-500"
                    )}
                  >
                    <div className="font-bold text-center">
                      {pt === "Fixed"
                        ? "Sabit"
                        : pt === "Starting from"
                          ? "Başlayan"
                          : "Əlaqə saxla"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* [BLOK 5] — Açar sözlər */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Tag className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-955">
                  Açar sözlər
                </CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Axtarış sorğularını hədəfləyir
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap gap-2 min-h-[28px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold rounded-lg"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="məsələn: CRM, mühasibat... (Enter ilə əlavə edin)"
              className="h-11 px-4 text-sm rounded-xl"
            />
          </CardContent>
        </Card>

        {/* [BLOK 6] — Media */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <FileImage className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-955">
                  Media
                </CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Şəkillər məhsul səhifəsində göstəriləcək
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Existing Images */}
              {existingImages.map((url, idx) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group"
                >
                  <img
                    src={url}
                    className="w-full h-full object-cover"
                    alt={`Existing ${idx}`}
                  />
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
              {newFiles.map((f) => (
                <div
                  key={f.id}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-indigo-200 border-dashed group"
                >
                  {f.file.type.startsWith("image") ? (
                    <img
                      src={f.preview}
                      className="w-full h-full object-cover"
                      alt="New"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-400 font-bold">
                      Fayl
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setNewFiles(newFiles.filter((item) => item.id !== f.id))
                    }
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
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:border-indigo-200 hover:bg-indigo-50/20 transition-all text-gray-400 hover:text-indigo-500"
                >
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-xs font-semibold">Fayl əlavə et</span>
                  <input
                    id="file-upload"
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileUpload}
                  />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* [BLOK 7] — Dillər */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Languages className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-955">
                  Çoxdilli yayım
                </CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  EN və RU dillərini aktivləşdir
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      if (lang.code === "AZ") return;
                      setSelectedLanguages((prev) =>
                        prev.includes(lang.code)
                          ? prev.filter((l) => l !== lang.code)
                          : [...prev, lang.code]
                      );
                    }}
                    className={cn(
                      "py-2.5 text-xs font-semibold rounded-xl border transition-all",
                      selectedLanguages.includes(lang.code)
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100 hover:border-gray-200"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {selectedLanguages.length > 1 && (
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={!name || !description || isTranslating}
                    className="w-full py-2.5 text-sm font-semibold rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Tərcümə
                        edilir...
                      </>
                    ) : (
                      <>
                        <Languages className="h-4 w-4" /> AI ilə tərcümə et
                      </>
                    )}
                  </button>
                  {translationError && (
                    <p className="text-xs text-red-500">{translationError}</p>
                  )}
                  {translationResult && !isTranslating && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {Object.keys(translationResult).length} dil tərcümə edildi
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* [BLOK 8] — Əlaqə & Müraciət */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <ExternalLink className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-955">
                  Əlaqə & Müraciət
                </CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ziyarətçilər məhsul səhifəsindən necə əlaqə qursun?
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
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
            <div className="space-y-2">
              <Label>Vebsayt / Məhsul linki</Label>
              <Input
                type="url"
                placeholder={company?.website || "https://..."}
                value={contactWebsite}
                onChange={(e) => setContactWebsite(e.target.value)}
                className="h-11 px-4 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                type="tel"
                placeholder={companyPhone || "+994 XX XXX XX XX"}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-11 px-4 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                type="tel"
                placeholder={companyPhone || "+994 XX XXX XX XX"}
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                className="h-11 px-4 text-sm rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Xüsusi link</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={contactCustomUrl}
                  onChange={(e) => setContactCustomUrl(e.target.value)}
                  className="h-11 px-4 text-sm rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Link mətni</Label>
                <Input
                  type="text"
                  placeholder="Sifariş ver"
                  value={contactCustomLabel}
                  onChange={(e) => setContactCustomLabel(e.target.value)}
                  className="h-11 px-4 text-sm rounded-xl"
                />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-700">Leads formu</p>
                  <p className="text-xs text-slate-400">
                    Ziyarətçilər birbaşa məhsul səhifəsindən müraciət göndərə bilsin
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLeadsEnabled(!leadsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    leadsEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      leadsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex flex-col gap-4 items-end pt-6">
          {error && (
            <div className="w-full text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
              <X className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={!name || !description || !categoryId || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-10 h-12 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saxlanılır...
              </>
            ) : (
              "Dəyişiklikləri saxla"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
