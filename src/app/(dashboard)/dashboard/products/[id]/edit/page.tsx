"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, slugify } from "@/lib/utils";
import {
  X,
  Upload,
  Loader2,
  CheckCircle2,
  Info,
  DollarSign,
  Languages,
  FileText,
  FileImage,
  Building2,
  Tag,
  CreditCard,
  Type,
  Layout,
  Pencil
} from "lucide-react";
import { toast } from "sonner";

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const productId = params.id as string;

  // Data State
  const [categories, setCategories] = useState<any[]>([]);
  const [company, setCompany] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string; id: string }[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<Locale[]>(['AZ']);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Fetch Company
      const { data: compData } = await supabase
        .from("companies")
        .select("id, owner_id")
        .eq("owner_id", user.id)
        .single();

      if (!compData) {
        router.push("/dashboard");
        return;
      }
      setCompany(compData);

      // 2. Fetch Product & Translations
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*, translations:product_translations(*)")
        .eq("id", productId)
        .single();

      if (productError || !product || product.company_id !== compData.id) {
        toast.error("Məhsul tapılmadı və ya giriş icazəniz yoxdur");
        router.push("/dashboard/products");
        return;
      }

      // Pre-fill fields
      setType(product.type || 'product');
      setCategoryId(product.category_id || "");
      setExistingImages(product.images || []);
      
      const azTranslation = product.translations?.find((t: any) => t.locale === 'az');
      if (azTranslation) {
        setName(azTranslation.name || "");
        setDescription(azTranslation.description || "");
        const features = azTranslation.features || {};
        
        // Fallback for category_id from features if not in products table
        if (!product.category_id && features.category_id) {
          setCategoryId(features.category_id);
        }

        setPrice(features.price !== null && features.price !== undefined ? String(features.price) : "");
        setCurrency(features.currency || "AZN");
        setPriceType(features.price_type || "Fixed");
        setTags(features.keywords || []);
      }

      const locales = product.translations?.map((t: any) => t.locale.toUpperCase() as Locale) || ['AZ'];
      setSelectedLanguages(locales);

      // 3. Fetch Categories
      const { data: catData } = await supabase.from("categories").select("*").order("name");
      if (catData) setCategories(catData);

      setIsLoading(false);
    }
    init();
  }, [productId, router, supabase]);

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
    const filesToAdd = Array.from(e.target.files || []);
    if (existingImages.length + newFiles.length + filesToAdd.length > 5) {
      toast.error("Maksimum 5 fayl əlavə edə bilərsiniz");
      return;
    }

    filesToAdd.forEach(file => {
      if (file.size > 100 * 1024 * 1024) return;
      const preview = URL.createObjectURL(file);
      setNewFiles(prev => [...prev, { file, preview, id: Math.random().toString(36).substr(2, 9) }]);
    });
  };

  const removeExistingImage = (url: string) => {
    setExistingImages(existingImages.filter(img => img !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Upload new media files
      const newUploadedUrls: string[] = [];
      for (const item of newFiles) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${company?.id}-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, item.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
        newUploadedUrls.push(publicUrl);
      }

      const finalImages = [...existingImages, ...newUploadedUrls];

      // 2. Update Product
      const { error: productError } = await supabase
        .from('products')
        .update({
          type,
          category_id: categoryId,
          images: finalImages,
        })
        .eq('id', productId);

      if (productError) throw productError;

      // 3. Upsert Translations
      for (const locale of selectedLanguages) {
        const { error: transError } = await supabase
          .from('product_translations')
          .upsert({
            product_id: productId,
            locale: locale.toLowerCase(),
            name,
            description,
            features: {
              keywords: tags,
              price: price || null,
              currency,
              price_type: priceType,
              category_id: categoryId
            }
          }, { onConflict: 'product_id,locale' });

        if (transError) throw transError;
      }

      toast.success("Məhsul yeniləndi");
      router.push("/dashboard/products");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Xəta baş verdi");
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Məhsulu Redaktə Et</h1>
          <p className="text-muted-foreground">Məhsul və ya xidmət məlumatlarını yeniləyin.</p>
        </div>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-10 space-y-12">
          <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-12">
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
              <div className="grid gap-6">
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
                  <Label>Təsvir</Label>
                  <Textarea
                    required
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                    className="px-4 py-3 text-sm rounded-xl resize-none"
                  />
                  <div className="text-right text-xs text-muted-foreground">{description.length} / 1000</div>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-100" />

            {/* 3. Price Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800">Qiymət</span>
              </div>
              <div className="flex h-11 rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-white">
                <div className="flex items-center justify-center w-12 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-500 shrink-0">
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
                  className="px-3 text-sm font-medium bg-gray-50 border-l border-gray-200 outline-none cursor-pointer"
                >
                  <option value="AZN">AZN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
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
                        "px-4 py-2.5 text-xs font-medium rounded-xl border transition-all min-w-[130px]",
                        priceType === pt
                          ? "bg-white border-indigo-200 text-indigo-600 shadow-sm"
                          : "bg-gray-50 border-gray-100 text-gray-500"
                      )}
                    >
                      <div className="font-bold text-center">{pt === 'Fixed' ? 'Sabit' : pt === 'Starting from' ? 'Başlayan' : 'Əlaqə saxla'}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="bg-gray-100" />

            {/* 4. Tags */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800">Açar sözlər</span>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold rounded-lg"
                    >
                      #{tag}
                      <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>
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
                  placeholder="məsələn: CRM, mühasibat... (Enter ilə əlavə edin)"
                  className="h-11 px-4 text-sm rounded-xl"
                />
              </div>
            </div>

            <Separator className="bg-gray-100" />

            {/* 5. Media */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800">Media</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Existing Images */}
                {existingImages.map((url, idx) => (
                  <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group">
                    <img src={url} className="w-full h-full object-cover" alt={`Existing ${idx}`} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* New Files */}
                {newFiles.map((f) => (
                  <div key={f.id} className="relative aspect-square rounded-2xl overflow-hidden border border-indigo-200 border-dashed group">
                    {f.file.type.startsWith('image') ? (
                      <img src={f.preview} className="w-full h-full object-cover" alt="New" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-400 font-bold">Fayl</div>
                    )}
                    <button
                      type="button"
                      onClick={() => setNewFiles(newFiles.filter(item => item.id !== f.id))}
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
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:border-indigo-200 hover:bg-indigo-50/20 transition-all text-gray-400 hover:text-indigo-500"
                  >
                    <Upload className="h-8 w-8 mb-2" />
                    <span className="text-xs font-semibold">Fayl əlavə et</span>
                    <input id="file-upload" type="file" hidden multiple onChange={handleFileUpload} />
                  </button>
                )}
              </div>
            </div>

            <Separator className="bg-gray-100" />

            {/* 6. Languages */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-800">Dillər</span>
              </div>
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
                        : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={!name || !description || isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-10 h-12 shadow-lg shadow-indigo-100"
              >
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saxlanılır...</> : "Dəyişiklikləri saxla"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
