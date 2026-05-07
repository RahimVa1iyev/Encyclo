"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, slugify } from "@/lib/utils";
import {
  Plus,
  X,
  Upload,
  Loader2,
  CheckCircle2,
  Info,
  DollarSign,
  Languages,
  FileVideo,
  FileText,
  FileImage,
  Building2,
  Tag,
  CreditCard,
  Type,
  Layout
} from "lucide-react";
import type { Category, Company, CompanyTranslation } from "@/types";

// shadcn UI imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
type ProductType = 'product' | 'service';
type PriceType = 'Fixed' | 'Starting from' | 'Contact us';
type Locale = 'AZ' | 'EN' | 'RU' | 'DE' | 'FR' | 'ES' | 'TR' | 'ZH';

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: 'AZ', label: 'AZ' },
  { code: 'EN', label: 'EN' },
  { code: 'RU', label: 'RU' },
  { code: 'DE', label: 'DE' },
  { code: 'FR', label: 'FR' },
  { code: 'ES', label: 'ES' },
  { code: 'TR', label: 'TR' },
  { code: 'ZH', label: 'ZH' },
];

export default function AddContentPage() {
  const router = useRouter();
  const supabase = createClient();

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [company, setCompany] = useState<(Company & { translations: CompanyTranslation[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<ProductType>('product');
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("AZN");
  const [priceType, setPriceType] = useState<PriceType>("Fixed");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState<{ file: File; preview: string; id: string }[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<Locale[]>(['AZ']);

  // Fetch initial data
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch Company
      const { data: compData } = await supabase
        .from("companies")
        .select("*, translations:company_translations(*)")
        .eq("owner_id", user.id)
        .single();

      if (!compData) {
        router.push("/onboarding");
        return;
      }
      setCompany(compData);

      // Fetch Categories
      const { data: catData } = await supabase.from("categories").select("*").order("name");
      if (catData) setCategories(catData);

      setIsLoading(false);
    }
    init();
  }, []);

  // Cost Calculation
  const mediaCost = files.length * 0.50;
  const langCost = (selectedLanguages.length - 1) * 4.00;
  const aiCost = 12.00;
  const totalCost = mediaCost + langCost + aiCost;

  // Handlers
  const handleAddTag = (e: React.KeyboardEvent | React.FocusEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter' && (e as React.KeyboardEvent).key !== ',') return;
    if (e.type === 'keydown') e.preventDefault();

    const value = tagInput.trim().replace(/,$/, "");
    if (value && !tags.includes(value) && tags.length < 10) {
      setTags([...tags, value]);
      setTagInput("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (files.length + newFiles.length > 5) return;

    newFiles.forEach(file => {
      if (file.size > 100 * 1024 * 1024) return;
      const preview = URL.createObjectURL(file);
      setFiles(prev => [...prev, { file, preview, id: Math.random().toString(36).substr(2, 9) }]);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Upload Media
      const uploadedUrls: string[] = [];
      for (const item of files) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${company?.id}-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, item.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      // 2. Insert Product
      const slug = slugify(name);
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          company_id: company?.id,
          slug,
          status: 'draft',
          images: uploadedUrls,
          type
        })
        .select()
        .single();

      if (productError) throw productError;

      // 3. Insert Translations
      const translations = selectedLanguages.map(locale => ({
        product_id: product.id,
        locale: locale.toLowerCase(),
        name,
        description,
        features: {
          keywords: tags,
          price: price || null,
          currency,
          price_type: priceType
        }
      }));

      const { error: transError } = await supabase.from('product_translations').insert(translations);
      if (transError) throw transError;

      setSuccessMessage("Product submitted for AI processing!");

      // Reset form
      setTimeout(() => {
        setName("");
        setDescription("");
        setPrice("");
        setTags([]);
        setFiles([]);
        setSelectedLanguages(['AZ']);
        setSuccessMessage(null);
      }, 3000);

    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Məzmun Əlavə Et</h1>
          <p className="text-muted-foreground">Məhsul və ya xidmətlərinizi ensiklopediyaya əlavə edin — AI axtarışlarda tapılsın.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-2xl border-gray-100/80 shadow-sm overflow-hidden">
            <CardContent className="p-10 space-y-12">
              <form id="add-content-form" onSubmit={handleSubmit} className="space-y-12">

                {/* 1. Type Toggle */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layout className="h-4 w-4 text-indigo-600" />
                    <Label className="text-sm font-semibold text-gray-700">Məzmun Növü</Label>
                  </div>
                  <div className="flex p-1 bg-gray-50 border border-gray-200 rounded-xl w-fit gap-1">
                    {['product', 'service'].map((t) => (
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
                        {t === 'product' ? 'Məhsul' : 'Xidmət'}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* 2. Basic Info */}
                <div className="space-y-6">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-semibold text-gray-800">Ad</span>
                    </div>
                    <p className="text-xs text-gray-400 pl-6">AI axtarışda birinci baxılan sahə</p>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-600">Ad</Label>
                      <Input
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={type === 'product' ? "e.g. Biznes Kartı, CRM Proqramı, Sığorta Paketi" : "e.g. Veb Sayt Hazırlanması, Mühasibat Xidməti"}
                        className="h-11 px-4 text-sm rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-600">Kateqoriya</Label>
                      <Select value={categoryId} onValueChange={setCategoryId} required>
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

                    <div className="space-y-2">
                      <div className="space-y-0.5 mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm font-semibold text-gray-800">Təsvir</span>
                        </div>
                        <p className="text-xs text-gray-400 pl-6">Ətraflı təsvir SEO nəticələrinə birbaşa təsir edir</p>
                      </div>
                      <Textarea
                        required
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                        placeholder="Məhsulunuzu ətraflı təsvir edin — xüsusiyyətlər, üstünlüklər, hədəf auditoriya, istifadə sahələri..."
                        className="px-4 py-3 text-sm rounded-xl resize-none"
                      />
                      <div className="text-right text-xs text-muted-foreground">{description.length} / 1000</div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* 3. Price Info */}
                <div className="space-y-6">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-semibold text-gray-800">Qiymət</span>
                    </div>
                    <p className="text-xs text-gray-400 pl-6">&apos;X AZN-ə CRM&apos; axtarışlarında üst sıraya çıxarır</p>
                  </div>

                  <div className="mt-2">
                    <div className="flex h-11 rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent bg-white">
                      <div className="flex items-center justify-center w-12 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-500 select-none shrink-0">
                        {currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€'}
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
                        className="px-3 text-sm font-medium bg-gray-50 border-l border-gray-200 outline-none cursor-pointer text-gray-700 shrink-0"
                      >
                        <option value="AZN">AZN</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-600">Qiymət növü</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Fixed', 'Starting from', 'Contact us'].map((pt) => (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setPriceType(pt as PriceType)}
                          className={cn(
                            "px-4 py-2.5 text-xs font-medium rounded-xl border transition-all text-left min-w-[130px]",
                            priceType === pt
                              ? "bg-white border-indigo-200 text-indigo-600 shadow-sm"
                              : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-white hover:border-gray-200"
                          )}
                        >
                          <div className="font-bold">{pt === 'Fixed' ? 'Sabit' : pt === 'Starting from' ? 'Başlayan' : 'Əlaqə saxla'}</div>
                          <div className="text-[10px] opacity-70 font-normal">
                            {pt === 'Fixed' && "Dəqiq qiymət"}
                            {pt === 'Starting from' && "Minimum qiymət"}
                            {pt === 'Contact us' && "Qiymət gizli"}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 italic px-1">
                      {priceType === 'Fixed' && "• Dəqiq qiymət göstərilir"}
                      {priceType === 'Starting from' && "• Minimum qiymət göstərilir — 'X AZN-dən' formatında"}
                      {priceType === 'Contact us' && "• Qiymət göstərilmir — əlaqə məlumatı önə çıxır"}
                    </p>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* 4. Tags */}
                <div className="space-y-6">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-semibold text-gray-800">Açar sözlər</span>
                    </div>
                    <p className="text-xs text-gray-400 pl-6">Axtarış sorğularını hədəfləyir</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold rounded-lg"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setTags(tags.filter(t => t !== tag))}
                            className="ml-1 p-0.5 hover:text-red-500 transition-colors rounded"
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
                      onBlur={handleAddTag}
                      placeholder="məsələn: CRM, mühasibat, biznes... (Enter ilə əlavə edin)"
                      className="h-11 px-4 text-sm rounded-xl"
                    />
                    <p className="text-[11px] text-muted-foreground">Maksimum 10 açar söz əlavə edə bilərsiniz.</p>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* 5. Media Upload */}
                <div className="space-y-6">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-semibold text-gray-800">Media</span>
                    </div>
                    <p className="text-xs text-gray-400 pl-6">Şəkil və videolar məhsul səhifəsində göstəriləcək.</p>
                  </div>

                  {files.length < 5 && (
                    <div
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-2xl transition-all cursor-pointer text-center group",
                        files.length > 0
                          ? "border-gray-100 bg-gray-50/30 p-6 hover:border-indigo-200"
                          : "border-gray-100 bg-gray-50/50 p-12 hover:border-indigo-200 hover:bg-indigo-50/20"
                      )}
                    >
                      <input id="file-upload" type="file" hidden multiple onChange={handleFileUpload} />
                      <Upload className={cn(
                        "text-gray-400 mx-auto mb-2 group-hover:text-indigo-500 transition-colors",
                        files.length > 0 ? "h-6 w-6" : "h-10 w-10 mb-3"
                      )} />
                      <p className="text-sm font-semibold text-gray-700">
                        {files.length > 0 ? "Daha fayl əlavə et" : "Faylları bura sürükləyin və ya seçin"}
                      </p>
                      {files.length === 0 && (
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP, MP4, PDF (Maks 100MB)</p>
                      )}
                    </div>
                  )}

                  {files.length > 0 && (
                    <div className="grid grid-cols-1 gap-3">
                      {files.map((f) => (
                        <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in zoom-in-95">
                          <div className="flex items-center gap-3">
                            {f.file.type.startsWith('image') ? (
                              <img src={f.preview} className="h-12 w-12 object-cover rounded-lg shadow-sm" />
                            ) : (
                              <div className="h-12 w-12 bg-indigo-100 flex items-center justify-center rounded-lg">
                                <FileText className="h-6 w-6 text-indigo-600" />
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-gray-900 truncate max-w-[220px]">
                                {f.file.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{(f.file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setFiles(files.filter(item => item.id !== f.id))}>
                            <X className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          {/* Language Selector */}
          <Card className="rounded-2xl border-gray-100/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 pt-6 px-6">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Languages className="h-4 w-4 text-indigo-600" /> Çoxdilli Yayım
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      if (lang.code === 'AZ') return;
                      setSelectedLanguages(prev =>
                        prev.includes(lang.code) ? prev.filter(l => l !== lang.code) : [...prev, lang.code]
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
              <p className="mt-4 text-[10px] text-muted-foreground leading-relaxed">
                AZ daxildir. Hər əlavə dil üçün +$4.00 — məzmun həmin dildə ayrıca səhifədə yayımlanır.
              </p>
            </CardContent>
          </Card>

          {/* Cost Estimate */}
          <Card className="rounded-2xl border-gray-100/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 pt-6 px-6">
              <CardTitle className="text-sm font-bold">Təxmini Xərc</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Media Assets ({files.length})</span>
                  <span>${mediaCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Dillər ({selectedLanguages.length - 1})</span>
                  <span>${langCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Baza xərci</span>
                  <span>$12.00</span>
                </div>
                <Separator className="my-2 bg-gray-100" />
                <div className="flex justify-between font-black text-gray-900 text-base">
                  <span>Toplam</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="add-content-form"
                disabled={!name || !description || isSubmitting}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl shadow-md shadow-indigo-100/50 transition-all active:scale-[0.98] text-sm"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Emal edilir...</>
                ) : (
                  "Yayımla →"
                )}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">Məlumatlar yoxlanıldıqdan sonra ensiklopediyada yayımlanacaq.</p>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-sm border-gray-100/80 sticky top-6 bg-gradient-to-b from-white to-gray-50/50 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 pt-6 px-6">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Canlı Baxış</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              {/* Company header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {company?.logo_url 
                    ? <img src={company.logo_url} className="h-full w-full object-cover" alt="logo" /> 
                    : <Building2 className="h-5 w-5 text-gray-300" />
                  }
                </div>
                <p className="text-xs font-semibold text-gray-700 truncate">
                  {company?.translations?.[0]?.name || "Şirkətiniz"}
                </p>
              </div>

              {/* Product type badge */}
              <div>
                <span className={cn(
                  "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                  type === 'product' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                )}>
                  {type === 'product' ? 'Məhsul' : 'Xidmət'}
                </span>
              </div>

              {/* Product name */}
              <h4 className="text-base font-bold text-gray-900 leading-snug">
                {name || <span className="text-gray-300 font-normal">Ad daxil edilməyib</span>}
              </h4>

              {/* Description */}
              {description && (
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">
                  {description}
                </p>
              )}

              {/* Price */}
              {price && (
                <p className="text-base font-black text-indigo-600">
                  {price} {currency}
                  <span className="ml-1 text-[10px] text-gray-400 font-normal">
                    / {priceType === 'Fixed' ? 'Sabit' : priceType === 'Starting from' ? 'Başlanğıc' : 'Əlaqə'}
                  </span>
                </p>
              )}

              {/* Tags — show ALL tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-[10px] text-gray-600 rounded-md font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Media preview — show first image if uploaded */}
              {files.length > 0 && files[0].file.type.startsWith('image') && (
                <div className="pt-1">
                  <img 
                    src={files[0].preview} 
                    alt="preview" 
                    className="w-full h-32 object-cover rounded-xl border border-gray-100"
                  />
                  {files.length > 1 && (
                    <p className="text-[10px] text-gray-400 mt-1 text-right">
                      +{files.length - 1} fayl daha
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Success Banner */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 duration-500 z-50">
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none tracking-tight">Məhsul uğurla əlavə edildi!</p>
            <p className="text-sm opacity-90 mt-1 font-medium">Tezliklə ensiklopediyada görünəcək.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSuccessMessage(null)} className="ml-4 hover:bg-white/10 text-white rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

