"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, Upload, Building2, Globe, FileText, Search } from "lucide-react";

export default function CompanyProfilePage() {
  const router = useRouter();
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
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: company } = await supabase
        .from('companies')
        .select('*, translations:company_translations(*), category:categories(*)')
        .eq('owner_id', user.id)
        .single();

      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (company) {
        setCompanyId(company.id);
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
  }, [router, supabase]);

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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Şirkət Profili</h1>
        <p className="text-muted-foreground mt-1">Şirkətiniz haqqında məlumatları yeniləyin</p>
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
              className="rounded-xl h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Kateqoriya</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category" className="rounded-xl h-11 border-gray-200 focus:ring-indigo-500">
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
                className="pl-10 rounded-xl h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
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
              className="rounded-xl min-h-[120px] border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all resize-none"
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
              className="rounded-xl h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
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
              className="rounded-xl min-h-[100px] border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all resize-none"
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
