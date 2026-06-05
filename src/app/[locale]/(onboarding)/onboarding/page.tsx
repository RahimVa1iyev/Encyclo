import { getSession } from "next-auth/react";
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from '@/lib/navigation';
import { useSession } from "next-auth/react";
import { getOnboardingDataAction, updateOnboardingStep1Action, updateCompanyLogoAction, finishOnboardingAction } from "../actions";
import { cn, inputClass, selectClass } from "@/lib/utils";
import {
  Check,
  Upload,
  ArrowRight,
  Loader2,
  Globe,
  Building2,
  FileText,
  Sparkles,
} from "lucide-react";
import type { Category, Company, CompanyTranslation } from "@/types";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [company, setCompany] = useState<
    (Company & { translations: CompanyTranslation[] }) | null
  >(null);

  // Step 1 State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [stepError, setStepError] = useState<string | null>(null);

  // Step 2 State
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 State
  const [finishError, setFinishError] = useState<string | null>(null);

  const router = useRouter();
  useEffect(() => {
    async function init() {
      const data = await getOnboardingDataAction();
      if (!data) {
        router.push("/login");
        return;
      }

      if (data.categories) setCategories(data.categories as any);
      
      const compData = data.company;
      if (compData) {
        setCompany(compData as any);
        setName(compData.translations?.[0]?.name || "");
        setCategoryId(compData.category_id || "");
        setWebsite(compData.website || "");
        setDescription(compData.translations?.[0]?.description || "");
        setLogoPreview(compData.logo_url || null);
      }

      setIsLoading(false);
    }
    init();
  }, [router]);

  const generateAIDescription = async () => {
    if (!name || !categoryId) return;
    setIsGenerating(true);
    setStepError(null);
    try {
      const selectedCategory =
        categories.find((c) => c.id === categoryId)?.name || "";
      const res = await fetch("/api/ai-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: name,
          categoryName: selectedCategory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "AI generasiya zamanı xəta baş verdi");
      }

      const data = await res.json();
      setDescription(data.description || "");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "AI ilə təsvir yaradıla bilmədi";
      setStepError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStep1 = async () => {
    if (!name || !categoryId) return;

    if (!company?.id) {
      setStepError("Şirkət məlumatı tapılmadı");
      return;
    }

    setIsSaving(true);
    setStepError(null);

    try {
      await updateOnboardingStep1Action(company.id, categoryId, website, name, description);

      setCurrentStep(2);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xəta baş verdi";
      setStepError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError("Şəkil 5MB-dan kiçik olmalıdır");
      return;
    }

    setLogoUploadError(null);
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveLogo = async () => {
    if (!company?.id) {
      setLogoUploadError("Şirkət məlumatı tapılmadı");
      return;
    }

    if (!logoFile) {
      setCurrentStep(3);
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', logoFile);
      formData.append('folder', 'logos');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Logo yüklənərkən xəta baş verdi');
      }

      const data = await uploadRes.json();
      const publicUrl = data.url;

      await updateCompanyLogoAction(company.id, publicUrl);

      setLogoPreview(publicUrl);
      setCurrentStep(3);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xəta baş verdi";
      setLogoUploadError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const finishOnboarding = async () => {
    if (!company?.id) {
      setFinishError("Şirkət məlumatı tapılmadı");
      return;
    }

    setIsSaving(true);
    setFinishError(null);
    try {
      await finishOnboardingAction(company.id);

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xəta baş verdi";
      setFinishError(message);
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

      {/* Step Indicator Names */}
      <div className="px-8 pt-4 pb-2 flex justify-between text-[11px] font-semibold text-gray-400 border-b border-gray-50">
        <span
          className={cn(
            "transition-colors",
            currentStep >= 1 ? "text-indigo-600 font-bold" : ""
          )}
        >
          1. Şirkət məlumatları
        </span>
        <span
          className={cn(
            "transition-colors",
            currentStep >= 2 ? "text-indigo-600 font-bold" : ""
          )}
        >
          2. Logo
        </span>
        <span
          className={cn(
            "transition-colors",
            currentStep >= 3 ? "text-indigo-600 font-bold" : ""
          )}
        >
          3. Hazırdır
        </span>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kateqoriya
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={selectClass}
              >
                <option value="">Kateqoriya seçin</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Təsvir
                </label>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                  AI oxuyur 🤖
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                rows={4}
                className={cn(inputClass, "resize-none")}
                placeholder="ChatGPT bu məlumatı oxuyur — şirkətinizin nə etdiyini, kimə xidmət etdiyini və niyə seçilməli olduğunu yazın."
              />
              <div className="flex items-center justify-between mt-1.5">
                <button
                  type="button"
                  onClick={generateAIDescription}
                  disabled={!name || !categoryId || isGenerating}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-1 px-2 rounded-lg bg-indigo-50 border border-indigo-100 hover:bg-indigo-100"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Təsvir yaradılır...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      AI ilə yaz
                    </>
                  )}
                </button>
                <div className="text-right text-xs text-gray-400">
                  {description.length} / 500
                </div>
              </div>
            </div>

            {stepError && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {stepError}
              </div>
            )}

            <button
              onClick={handleStep1}
              disabled={!name || !categoryId || isSaving}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Növbəti <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Logo */}
        {currentStep === 2 && (
          <div className="space-y-6 text-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleLogoUpload(file);
              }}
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer group",
                isDragOver
                  ? "border-indigo-500 bg-indigo-50/50"
                  : "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30"
              )}
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
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-32 w-32 object-contain rounded-lg mb-4 shadow-md bg-white"
                  />
                  <p className="text-sm text-indigo-600 font-medium">
                    Loqonu dəyişmək üçün klikləyin
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-semibold">
                    Logo yükləmək üçün klikləyin və ya sürükləyin
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG və ya WEBP, maksimum 5MB
                  </p>
                </div>
              )}
            </div>

            {logoUploadError && (
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg border border-red-100">
                {logoUploadError}
              </p>
            )}

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
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Növbəti"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ready */}
        {currentStep === 3 && (
          <div className="space-y-6 text-center py-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                <Check className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">
                Xülasə
              </h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{name}</p>
                  <p className="text-sm text-gray-500">
                    {categories.find((c) => c.id === categoryId)?.name ||
                      "Kateqoriya yoxdur"}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2 mt-6 px-2">
              <h4 className="font-semibold text-indigo-600 text-sm">
                İlk məhsulunuzu əlavə edərək AI axtarışda görünün
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                Dashboarda daxil olduqdan sonra şirkətinizin məhsul və xidmətlərini
                idarə edə, AI axtarış motorlarında (ChatGPT, Perplexity və s.)
                görünmə statusunuzu izləyə bilərsiniz.
              </p>
            </div>

            {finishError && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {finishError}
              </div>
            )}

            <button
              onClick={finishOnboarding}
              disabled={isSaving}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Dashboarda keç"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
