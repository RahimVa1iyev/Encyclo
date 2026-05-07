"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, inputClass, selectClass } from "@/lib/utils";
import { Check, Upload, ArrowRight, Loader2, Globe, Building2, FileText } from "lucide-react";
import type { Category, Company, CompanyTranslation } from "@/types";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [company, setCompany] = useState<(Company & { translations: CompanyTranslation[] }) | null>(null);
  
  // Step 1 State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  
  // Step 2 State
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch Categories
      const { data: catData } = await supabase.from("categories").select("*").order("name");
      if (catData) setCategories(catData);

      // Fetch Company
      const { data: compData, error } = await supabase
        .from("companies")
        .select(`
          *,
          translations:company_translations(*)
        `)
        .eq("owner_id", user.id)
        .single();

      if (compData) {
        setCompany(compData);
        setName(compData.translations?.[0]?.name || "");
        setCategoryId(compData.category_id || "");
        setWebsite(compData.website || "");
        setDescription(compData.translations?.[0]?.description || "");
        setLogoPreview(compData.logo_url || null);
      }
      
      setIsLoading(false);
    }
    init();
  }, []);

  const handleStep1 = async () => {
    if (!name || !categoryId) return;
    setIsSaving(true);
    
    try {
      // Update Company
      const { error: compError } = await supabase
        .from("companies")
        .update({ category_id: categoryId, website })
        .eq("id", company?.id);
      
      if (compError) throw compError;

      // Update Translation
      const { error: transError } = await supabase
        .from("company_translations")
        .update({ name, description })
        .eq("company_id", company?.id)
        .eq("locale", "az");

      if (transError) throw transError;

      setCurrentStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setLogoUploadError("Şəkil 2MB-dan kiçik olmalıdır");
      return;
    }
    
    setLogoUploadError(null);
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveLogo = async () => {
    if (!logoFile) {
      setCurrentStep(3);
      return;
    }

    setIsSaving(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${company?.id}-${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('logos')
        .upload(filePath, logoFile);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: publicUrl })
        .eq('id', company?.id);

      if (updateError) throw updateError;
      
      setLogoPreview(publicUrl);
      setCurrentStep(3);
    } catch (err: any) {
      setLogoUploadError(err.message || "Yükləmə zamanı xəta baş verdi");
    } finally {
      setIsSaving(false);
    }
  };

  const finishOnboarding = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("companies")
        .update({ onboarding_completed: true, status: 'active' })
        .eq("id", company?.id);
      
      if (error) throw error;

      await supabase.auth.updateUser({
        data: { onboarding_completed: true },
      });

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="h-2 w-full bg-gray-100">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500" 
          style={{ width: `${(currentStep / 3) * 100}%` }}
        />
      </div>

      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-1">
            {currentStep}/3-cü addım
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentStep === 1 && "Şirkət profilini tamamlayın"}
            {currentStep === 2 && "Logonuzu əlavə edin"}
            {currentStep === 3 && "Hər şey hazırdır!"}
          </h1>
        </div>

        {/* Step 1: Profile */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Şirkət adı
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Şirkət adını daxil edin"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kateqoriya</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={selectClass}
              >
                <option value="">Kateqoriya seçin</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" /> Vebsayt (İstəyə bağlı)
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={inputClass}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Təsvir
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                rows={4}
                className={cn(inputClass, "resize-none")}
                placeholder="Şirkətiniz haqqında yazın..."
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {description.length} / 500
              </div>
            </div>

            <button
              onClick={handleStep1}
              disabled={!name || !categoryId || isSaving}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Növbəti <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        )}

        {/* Step 2: Logo */}
        {currentStep === 2 && (
          <div className="space-y-6 text-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleLogoUpload(file);
              }}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-12 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
            >
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
              />
              
              {logoPreview ? (
                <div className="flex flex-col items-center">
                  <img src={logoPreview} alt="Logo preview" className="h-32 w-32 object-contain rounded-lg mb-4 shadow-md" />
                  <p className="text-sm text-indigo-600 font-medium">Loqonu dəyişmək üçün klikləyin</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-semibold">Logo yükləmək üçün klikləyin və ya sürükləyin</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG və ya WEBP, maksimum 2MB</p>
                </div>
              )}
            </div>

            {logoUploadError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">{logoUploadError}</p>}

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 text-gray-500 py-3 font-semibold hover:text-gray-700 transition-colors"
              >
                Sonraya saxla
              </button>
              <button
                onClick={saveLogo}
                disabled={isSaving}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Növbəti"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ready */}
        {currentStep === 3 && (
          <div className="space-y-8 text-center py-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <Check className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">Xülasə</h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{name}</p>
                  <p className="text-sm text-gray-500">
                    {categories.find(c => c.id === categoryId)?.name || "Kateqoriya yoxdur"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={finishOnboarding}
              disabled={isSaving}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Dashboarda keç"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
