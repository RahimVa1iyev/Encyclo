"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from '@/lib/navigation';
import { getOnboardingDataAction, updateOnboardingStep1Action, updateCompanyLogoAction, finishOnboardingAction } from "../actions";
import { cn, inputClass, selectClass } from "@/lib/utils";
import {
  Check,
  Upload,
  Loader2,
  Building2,
  Phone,
} from "lucide-react";
import type { Category, Company, CompanyTranslation } from "@/types";
import Step1CompanyInfo from "./steps/Step1CompanyInfo";
import Step2Contact from "./steps/Step2Contact";
import Step3Logo from "./steps/Step3Logo";
import Step4Ready from "./steps/Step4Ready";

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [company, setCompany] = useState<
    (Company & { translations: CompanyTranslation[] }) | null
  >(null);

  // Step 1 & 2 State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [email, setEmail] = useState("");
  const [foundingYear, setFoundingYear] = useState("");
  const [stepError, setStepError] = useState<string | null>(null);

  // Step 3 State
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4 State
  const [finishError, setFinishError] = useState<string | null>(null);

  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "loading") return;

    async function init() {
      // Email doğrulanmayıbsa yönləndir
      if (session && !(session.user as any)?.emailVerified) {
        router.push("/verify-email");
        return;
      }

      const data = await getOnboardingDataAction();
      if (!data) {
        router.push("/login");
        return;
      }
      if ("redirectTo" in data && typeof data.redirectTo === "string") {
        router.push(data.redirectTo);
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
        setPhone(compData.phone || "");
        setAddress(compData.translations?.[0]?.address || "");
        setTaxId(compData.tax_id || "");
        setEmail(compData.email || "");
        setFoundingYear(compData.founding_year ? compData.founding_year.toString() : "");
        setLogoPreview(compData.logo_url || null);
      }

      setIsLoading(false);
    }
    init();
  }, [router, session, status]);

  const handleStep1 = () => {
    if (!name || !categoryId) return;
    setStepError(null);
    setCurrentStep(2);
  };

  const handleStep2 = async () => {
    if (!company?.id) {
      setStepError("Şirkət məlumatı tapılmadı");
      return;
    }

    setIsSaving(true);
    setStepError(null);

    try {
      await updateOnboardingStep1Action({
        companyId: company.id,
        categoryId,
        website,
        name,
        description,
        phone,
        address,
        taxId,
        email,
        foundingYear
      });
      setCurrentStep(3);
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
      setCurrentStep(4);
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
      setCurrentStep(4);
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
    <div className="w-full max-w-sm mx-auto">
      
      {/* Premium Line + Glowing Orbs Step Indicator */}
      <div className="relative mb-12 w-full mx-auto mt-4">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-4 right-4 h-1.5 bg-secondary rounded-full overflow-hidden">
          {/* Progress Fill */}
          <div 
            className="h-full transition-all duration-700 ease-in-out" 
            style={{ 
              width: `${((currentStep - 1) / 3) * 100}%`,
              backgroundColor: 'var(--accent)',
            }} 
          />
        </div>

        <div className="relative flex justify-between">
          {[
            { id: 1, name: "Şirkət", icon: Building2 },
            { id: 2, name: "Əlaqə", icon: Phone },
            { id: 3, name: "Logo", icon: Upload },
            { id: 4, name: "Hazır", icon: Check },
          ].map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 w-16">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-4 border-background relative",
                    isActive ? "text-white shadow-lg ring-4 ring-accent/20 scale-110" : 
                    isCompleted ? "text-white" : "bg-secondary text-muted-foreground"
                  )}
                  style={isActive || isCompleted ? { backgroundColor: 'var(--accent)' } : undefined}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={cn(
                  "text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-center transition-colors duration-500 whitespace-nowrap absolute -bottom-6",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {currentStep === 1 && "Şirkət profilini tamamlayın"}
            {currentStep === 2 && "Əlaqə məlumatlarını daxil edin"}
            {currentStep === 3 && "Logonuzu əlavə edin"}
            {currentStep === 4 && "Hər şey hazırdır!"}
          </h1>
        </div>

        {/* Step 1: Profile */}
        {currentStep === 1 && (
          <Step1CompanyInfo
            name={name}
            setName={setName}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            website={website}
            setWebsite={setWebsite}
            description={description}
            setDescription={setDescription}
            categories={categories}
            onNext={handleStep1}
          />
        )}

        {/* Step 2: Contact */}
        {currentStep === 2 && (
          <Step2Contact
            phone={phone}
            setPhone={setPhone}
            address={address}
            setAddress={setAddress}
            email={email}
            setEmail={setEmail}
            foundingYear={foundingYear}
            setFoundingYear={setFoundingYear}
            taxId={taxId}
            setTaxId={setTaxId}
            stepError={stepError}
            isSaving={isSaving}
            onNext={handleStep2}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* Step 3: Logo */}
        {currentStep === 3 && (
          <Step3Logo
            logoPreview={logoPreview}
            isDragOver={isDragOver}
            setIsDragOver={setIsDragOver}
            fileInputRef={fileInputRef}
            handleLogoUpload={handleLogoUpload}
            logoUploadError={logoUploadError}
            isSaving={isSaving}
            onNext={saveLogo}
            onBack={() => setCurrentStep(2)}
            onSkip={() => setCurrentStep(4)}
          />
        )}

        {/* Step 4: Ready */}
        {currentStep === 4 && (
          <Step4Ready
            finishError={finishError}
            isSaving={isSaving}
            onFinish={finishOnboarding}
          />
        )}
      </div>
    </div>
  );
}
