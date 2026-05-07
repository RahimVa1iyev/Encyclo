"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Upload, Building2, Globe, FileText, Search, ExternalLink } from "lucide-react";
import { cn, inputClass, selectClass } from "@/lib/utils";
import type { Category } from "@/types";

export default function CompanyProfilePage() {
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string>('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companySlug, setCompanySlug] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const [compResult, catsResult] = await Promise.all([
        supabase
          .from('companies')
          .select('*, translations:company_translations(*), category:categories(*)')
          .eq('owner_id', user.id)
          .single(),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);

      const company = compResult.data;
      const cats = catsResult.data;

      if (company) {
        setCompanyId(company.id);
        setCompanySlug(company.slug || '');
        setCategoryId(company.category_id || '');
        setWebsite(company.website || '');
        setLogoUrl(company.logo_url || null);
        setLogoPreview(company.logo_url || null);
        
        const t = company.translations?.find((trans: any) => trans.locale === 'az');
        if (t) {
          setName(t.name || '');
          setDescription(t.description || '');
          setMetaTitle(t.meta_title || '');
          setMetaDescription(t.meta_description || '');
        }
      }
      if (cats) setCategories(cats);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo 2MB-dan böyük ola bilməz');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name || !categoryId) {
      toast.error('Ad və kateqoriya mütləqdir');
      return;
    }
    setIsSaving(true);
    try {
      // 1. Upload logo if changed
      let newLogoUrl = logoUrl;
      if (logoFile) {
        const ext = logoFile.name.split('.').pop();
        const path = `logos/${companyId}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(path, logoFile, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);
        newLogoUrl = publicUrl;
      }

      // 2. Update company
      const { error: compError } = await supabase
        .from('companies')
        .update({ category_id: categoryId, website, logo_url: newLogoUrl })
        .eq('id', companyId);
      
      if (compError) throw compError;

      // 3. Update translation
      const { error: transError } = await supabase
        .from('company_translations')
        .update({ 
          name, 
          description, 
          meta_title: metaTitle, 
          meta_description: metaDescription 
        })
        .eq('company_id', companyId)
        .eq('locale', 'az');
      
      if (transError) throw transError;

      if (newLogoUrl) setLogoUrl(newLogoUrl);
      setLogoFile(null);
      toast.success('Profil uğurla yeniləndi');
    } catch (err: any) {
      toast.error(err.message || 'Xəta baş verdi');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-xl" />
          <div className="h-4 w-72 bg-gray-100 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="h-14 bg-gray-50 border-b border-gray-100 px-6 flex items-center">
            <div className="h-5 w-24 bg-gray-200 rounded-lg" />
          </div>
          <div className="p-6 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded-lg" />
              <div className="h-3 w-48 bg-gray-100 rounded-lg" />
              <div className="h-8 w-28 bg-gray-100 rounded-xl mt-2" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="h-14 bg-gray-50 border-b border-gray-100 px-6 flex items-center">
            <div className="h-5 w-36 bg-gray-200 rounded-lg" />
          </div>
          <div className="p-6 space-y-5">
            <div className="h-11 w-full bg-gray-100 rounded-xl" />
            <div className="h-11 w-full bg-gray-100 rounded-xl" />
            <div className="h-11 w-full bg-gray-100 rounded-xl" />
            <div className="h-28 w-full bg-gray-100 rounded-xl" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="h-14 bg-gray-50 border-b border-gray-100 px-6 flex items-center">
            <div className="h-5 w-32 bg-gray-200 rounded-lg" />
          </div>
          <div className="p-6 space-y-5">
            <div className="h-11 w-full bg-gray-100 rounded-xl" />
            <div className="h-24 w-full bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Şirkət Profili</h1>
          <p className="text-muted-foreground mt-1">Şirkətiniz haqqında məlumatları yeniləyin</p>
        </div>
        {companySlug && (
          <a 
            href={`/encyclopedia/companies/${companySlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex-shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
            Ensiklopediyada bax
          </a>
        )}
      </div>

      {/* Section 1: Logo */}
      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
              <Building2 className="h-4 w-4" />
            </div>
            Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-inner bg-gray-100 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <label 
              htmlFor="logo-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Upload className="h-6 w-6" />
            </label>
            <input 
              id="logo-upload" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleLogoChange} 
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Şirkət loqosu</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG və ya GIF. Maksimum 2MB.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 rounded-xl"
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              Şəkil seçin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Əsas məlumatlar */}
      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
              <FileText className="h-4 w-4" />
            </div>
            Əsas məlumatlar
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Şirkət adı</Label>
            <Input 
              id="name" 
              placeholder="Şirkətin rəsmi adı" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Kateqoriya</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category" className={cn(selectClass, "h-11")}>
                <SelectValue placeholder="Kateqoriya seçin" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website">Veb sayt</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                id="website" 
                placeholder="https://example.com" 
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={cn(inputClass, "pl-10")}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Haqqımızda</Label>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{description.length} / 500</span>
            </div>
            <Textarea 
              id="description" 
              placeholder="Şirkətiniz haqqında qısa məlumat..." 
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              className={cn(inputClass, "min-h-[120px] resize-none py-3")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: SEO */}
      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                <Search className="h-4 w-4" />
              </div>
              SEO məlumatları
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-9">Bu məlumatlar axtarış nəticələrində (Google və s.) görünür</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="metaTitle">SEO Başlıq</Label>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{metaTitle.length} / 60</span>
            </div>
            <Input 
              id="metaTitle" 
              placeholder="Google-da görünəcək başlıq" 
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))}
              className={inputClass}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="metaDescription">SEO Təsvir</Label>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{metaDescription.length} / 160</span>
            </div>
            <Textarea 
              id="metaDescription" 
              placeholder="Google-da görünəcək qısa təsvir..." 
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
              className={cn(inputClass, "min-h-[100px] resize-none py-3")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving || !name || !categoryId}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 rounded-xl px-10 h-12 font-semibold transition-all active:scale-95 disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saxlanır...
            </>
          ) : (
            'Dəyişiklikləri saxla'
          )}
        </Button>
      </div>
    </div>
  );
}
