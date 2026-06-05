// app/(dashboard)/dashboard/company/page.tsx
"use client";

import { getSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Building2, Globe, MapPin, Mail, Phone, Upload, CheckCircle2, ChevronRight, ArrowRight, FileText, Search, Share2, Sparkles, BarChart3, X } from "lucide-react";
import { siteConfig } from '@/lib/config';
import type { Category } from "@/types";

const AI_QUESTIONS = [
  {
    text: "Şirkətiniz nə edir və hansı problemi həll edir?",
    placeholder: "məs: Azərbaycan şirkətləri üçün onlayn mühasibat proqramı — vergi hesabatlarını avtomatlaşdırırıq"
  },
  {
    text: "Əsas müştəriləriniz kimdir?",
    placeholder: "məs: 10-100 işçisi olan Azərbaycan MMC-ləri, xüsusilə mühasibatı olmayan kiçik bizneslər"
  },
  {
    text: "Rəqiblərdən əsas fərqiniz və üstünlüyünüz nədir?",
    placeholder: "məs: Azərbaycan vergi sisteminə tam uyğun, ASAN imza dəstəyi, 24/7 Azərbaycan dilində dəstək"
  },
  {
    text: "Nə vaxtdan fəaliyyət göstərirsiniz və hansı nailiyyətləriniz var?",
    placeholder: "məs: 2019-dan bəri, 500+ aktiv müştəri, aylıq 89 AZN-dən başlayan tariflərlə"
  }
];

const inputClass = "h-10 w-full rounded-xl border bg-surface px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]";
const inputStyle: React.CSSProperties = { borderColor: "var(--border)" };

// Card component inline
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-surface p-5 ${className}`} style={{ borderColor: "var(--border)" }}>
      {children}
    </div>
  );
}

// CardHeader component inline
function CardHeader({ icon: Icon, title, subtitle, right }: { icon: any; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: "var(--border)" }}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-bold leading-tight text-[var(--foreground)]">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

// Field component inline
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--foreground)]">{label}</span>
        {hint ? <span className="text-[10px] text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

// PrimaryButton component inline
function PrimaryButton({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
      {children}
    </button>
  );
}

// SecondaryButton component inline
function SecondaryButton({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-transparent px-4 text-sm font-semibold transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
      {children}
    </button>
  );
}

export default function CompanyProfilePage() {
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

  // Contact and GEO fields
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [foundingYear, setFoundingYear] = useState('');
  const [areaServed, setAreaServed] = useState('');

  // Social Links
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  // AI Panel states
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiAnswers, setAiAnswers] = useState<Record<number, string>>({});
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiPanelError, setAiPanelError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      const user = session?.user;
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { getCompanyProfileData } = await import('../../actions');
      const data = await getCompanyProfileData();

      if (!data) {
        setIsLoading(false);
        return;
      }

      const company = data.company;
      const cats = data.categories;

      if (company) {
        setCompanyId(company.id);
        setCompanySlug(company.slug || '');
        setCategoryId(company.category_id || '');
        setWebsite(company.website || '');
        setLogoUrl(company.logo_url || null);
        setLogoPreview(company.logo_url || null);

        // Contact and GEO fields
        setPhone(company.phone || '');
        setContactEmail(company.email || '');
        setFoundingYear(company.founding_year ? String(company.founding_year) : '');
        setAreaServed(company.area_served || '');
        
        const t = company.translations?.find((trans: any) => trans.locale === 'az');
        if (t) {
          setName(t.name || '');
          setDescription(t.description || '');
          setAddress(t.address || '');
          setMetaTitle(t.meta_title || '');
          setMetaDescription(t.meta_description || '');
        }

        // Fetch Social Links
        if (company.socialLinks) {
          const links: Record<string, string> = {};
          company.socialLinks.forEach((s: any) => { links[s.platform] = s.url; });
          setSocialLinks(links);
        }
      }
      if (cats) setCategories(cats as any);
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

  const handleGenerateContent = async () => {
    const answeredCount = Object.values(aiAnswers).filter(a => a.trim()).length;
    if (answeredCount < 2) {
      setAiPanelError('Ən azı 2 suala cavab verin');
      return;
    }
    setIsGeneratingContent(true);
    setAiPanelError(null);
    try {
      const selectedCategory = categories.find(c => c.id === categoryId)?.name || '';
      const answersText = AI_QUESTIONS.map((q, i) => ({
        question: q.text,
        answer: aiAnswers[i] || ''
      })).filter(a => a.answer.trim());

      const res = await fetch('/api/ai-company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: name,
          categoryName: selectedCategory,
          answers: answersText
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xəta baş verdi');

      setDescription(data.description || '');
      if (data.metaTitle) setMetaTitle(data.metaTitle);
      if (data.metaDescription) setMetaDescription(data.metaDescription);

      setShowAIPanel(false);
      setAiAnswers({});
      setAiPanelError(null);
      toast.success('Məzmun yaradıldı — meta sahələr avtomatik dolduruldu');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Xəta baş verdi';
      setAiPanelError(message);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleSave = async () => {
    if (!name || !categoryId) {
      toast.error('Ad və kateqoriya mütləqdir');
      return;
    }

    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
      toast.error("Veb sayt URL-i https:// ilə başlamalıdır");
      return;
    }

    setIsSaving(true);
    try {
      let newLogoUrl = logoUrl;
      if (logoFile) {
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
        newLogoUrl = data.url;
      }

      const platformsToSave = Object.entries(socialLinks).filter(([, url]) => url.trim()).map(([platform, url]) => ({ platform, url: url.trim() }));
      const emptyPlatforms = Object.entries(socialLinks).filter(([, url]) => !url.trim()).map(([p]) => p);

      const { updateCompanyProfile } = await import('../../actions');
      await updateCompanyProfile(companyId, {
        categoryId,
        website,
        logo_url: newLogoUrl,
        phone: phone || null,
        email: contactEmail || null,
        address: address || null,
        founding_year: foundingYear ? parseInt(foundingYear) : null,
        area_served: areaServed || null,
        name,
        description,
        metaTitle,
        metaDescription,
        platformsToSave,
        emptyPlatforms
      });

      if (newLogoUrl) setLogoUrl(newLogoUrl);
      setLogoFile(null);
      toast.success('Profil uğurla yeniləndi');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Xəta baş verdi';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const geoScore = useMemo(() => {
    const checks = [
      { key: 'logo', label: 'Logo var', passed: !!logoUrl },
      { key: 'description', label: 'Təsvir 100+ söz', passed: description.trim().split(/\s+/).filter(Boolean).length >= 100 },
      { key: 'website', label: 'Veb sayt var', passed: !!website },
      { key: 'metaTitle', label: 'SEO başlıq var', passed: !!metaTitle },
      { key: 'metaDesc', label: 'SEO təsvir var', passed: !!metaDescription },
      { key: 'phone', label: 'Telefon var', passed: !!phone },
      { key: 'social', label: 'Sosial media var', passed: Object.values(socialLinks).some(v => v.trim()) },
      { key: 'founding', label: 'Quruluş ili var', passed: !!foundingYear },
    ];
    const passedCount = checks.filter(c => c.passed).length;
    const percentage = Math.round((passedCount / checks.length) * 100);
    return { checks, percentage, passedCount, total: checks.length };
  }, [logoUrl, description, website, metaTitle, metaDescription, phone, socialLinks, foundingYear]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded-xl" />
          <div className="h-4 w-64 bg-gray-100 rounded-xl" />
        </div>
        
        {/* Grid layout */}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border bg-surface p-5 space-y-4" style={{ borderColor: "var(--border)" }}>
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-16 w-16 bg-gray-100 rounded-2xl" />
            </div>
            <div className="rounded-2xl border bg-surface p-5 space-y-4" style={{ borderColor: "var(--border)" }}>
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded-xl" />
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
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Şirkət profili</h2>
        <p className="mt-1 text-sm text-muted-foreground">Şirkətinizin AI ensiklopediyasındakı görünüşü</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Sol tərəf - Formlar */}
        <div className="space-y-5 lg:col-span-2">
          
          {/* Logo Card */}
          <Card>
            <CardHeader icon={Upload} title="Logo" subtitle="PNG/SVG, kvadrat tövsiyə olunur" />
            <div className="mt-4 flex items-center gap-4">
              <div 
                onClick={() => document.getElementById("logo-upload")?.click()}
                className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-black overflow-hidden border cursor-pointer select-none"
                style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)", borderColor: "var(--border)" }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <span>{name ? name.charAt(0).toUpperCase() : "CO"}</span>
                )}
              </div>
              
              <div 
                onClick={() => document.getElementById("logo-upload")?.click()}
                className="flex-1 rounded-xl border-2 border-dashed p-4 text-center cursor-pointer hover:border-[var(--accent)] transition-colors" 
                style={{ borderColor: "var(--border)" }}
              >
                <input 
                  id="logo-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleLogoChange} 
                />
                <p className="text-xs font-semibold text-[var(--foreground)]">Yeni logo yüklə</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Max 2MB · PNG, JPG, SVG</p>
              </div>
            </div>
          </Card>

          {/* Əsas məlumatlar Card */}
          <Card>
            <CardHeader 
              icon={Building2} 
              title="Əsas məlumatlar" 
              subtitle="Şirkətinizin profili" 
              right={
                <button
                  type="button"
                  onClick={() => {
                    if (showAIPanel) {
                      const hasData = Object.values(aiAnswers).some(a => a.trim());
                      if (hasData) {
                        const confirmed = window.confirm('Doldurulmuş cavablar silinəcək. Bağlamaq istəyirsiniz?');
                        if (!confirmed) return;
                      }
                      setShowAIPanel(false);
                      setAiAnswers({});
                      setAiPanelError(null);
                    } else {
                      if (!name || !categoryId) {
                        toast.warning('Əvvəlcə şirkət adı və kateqoriya doldurun');
                        return;
                      }
                      setShowAIPanel(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer"
                  style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}
                >
                  <Sparkles size={13} />AI ilə yaz
                </button>
              }
            />

            {/* AI Generator Panel */}
            {showAIPanel && (
              <div
                className="mt-4 rounded-xl border p-4 space-y-4"
                style={{
                  backgroundColor: "color-mix(in oklab, var(--accent) 6%, transparent)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} style={{ color: "var(--accent)" }} />
                    <span className="text-xs font-bold text-[var(--foreground)]">AI Köməkçisi</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAIPanel(false);
                      setAiAnswers({});
                      setAiPanelError(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {AI_QUESTIONS.map((question, i) => (
                    <div key={i} className="space-y-1">
                      <label className="block text-[11px] font-semibold text-[var(--foreground)]">{question.text}</label>
                      <textarea 
                        rows={2} 
                        value={aiAnswers[i] || ""}
                        onChange={(e) => setAiAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                        placeholder={question.placeholder}
                        className="w-full rounded-lg border bg-surface p-2 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]" 
                        style={inputStyle} 
                      />
                    </div>
                  ))}
                </div>

                {aiPanelError && (
                  <p className="text-xs text-red-500">{aiPanelError}</p>
                )}

                <div className="flex gap-2">
                  <PrimaryButton
                    type="button"
                    onClick={handleGenerateContent}
                    disabled={Object.values(aiAnswers).filter(a => a.trim()).length < 2 || isGeneratingContent}
                    className="flex-1"
                  >
                    {isGeneratingContent ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Yazılır...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> Yarat
                      </>
                    )}
                  </PrimaryButton>
                  <SecondaryButton type="button" onClick={() => setShowAIPanel(false)}>Bağla</SecondaryButton>
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Şirkət adı">
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Şirkətin adı"
                  className={inputClass} 
                  style={inputStyle} 
                />
              </Field>

              <Field label="Kateqoriya">
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
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

              <Field label="Veb sayt">
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    value={website} 
                    onChange={(e) => setWebsite(e.target.value)} 
                    placeholder="https://example.com"
                    className={`${inputClass} pl-9`} 
                    style={inputStyle} 
                  />
                </div>
              </Field>

              <Field label="Təsis ili">
                <input 
                  type="number" 
                  min="1900"
                  max="2026"
                  value={foundingYear} 
                  onChange={(e) => setFoundingYear(e.target.value)} 
                  placeholder="məs: 2018"
                  className={inputClass} 
                  style={inputStyle} 
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Təsvir">
                <textarea 
                  rows={5} 
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                  placeholder="Şirkətiniz haqqında ətraflı məlumat..."
                  className="w-full rounded-xl border bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]" 
                  style={inputStyle} 
                />
              </Field>
            </div>
          </Card>

          {/* Əlaqə Card */}
          <Card>
            <CardHeader icon={Phone} title="Əlaqə" subtitle="Müştərilərin sizə çatması üçün" />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Telefon">
                <input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+994 (50) 000-00-00"
                  className={inputClass} 
                  style={inputStyle} 
                />
              </Field>
              
              <Field label="Email">
                <input 
                  type="email"
                  value={contactEmail} 
                  onChange={(e) => setContactEmail(e.target.value)} 
                  placeholder="info@company.com"
                  className={inputClass} 
                  style={inputStyle} 
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Ünvan">
                  <input 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="Bakı şəhəri, Nizami küçəsi 100"
                    className={inputClass} 
                    style={inputStyle} 
                  />
                </Field>
              </div>
            </div>
          </Card>

          {/* Sosial Card */}
          <Card>
            <CardHeader icon={Share2} title="Sosial şəbəkələr" subtitle="Profil linkləri" />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                { label: "LinkedIn", key: "linkedin" },
                { label: "Facebook", key: "facebook" },
                { label: "Instagram", key: "instagram" },
                { label: "X (Twitter)", key: "twitter" },
                { label: "YouTube", key: "youtube" },
                { label: "TikTok", key: "tiktok" }
              ].map((s) => (
                <Field key={s.key} label={s.label}>
                  <input 
                    value={socialLinks[s.key] || ""}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, [s.key]: e.target.value }))}
                    placeholder={`https://${s.key === "twitter" ? "x" : s.key}.com/...`} 
                    className={inputClass} 
                    style={inputStyle} 
                  />
                </Field>
              ))}
            </div>
          </Card>
        </div>

        {/* Sağ tərəf - Sidebar */}
        <div className="space-y-5">
          <div className="lg:sticky lg:top-20 space-y-5">
            
            {/* GEO Hazırlığı widget */}
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[var(--foreground)]">GEO Hazırlığı</h3>
                <span className="text-xl font-black" style={{ color: "var(--accent)" }}>
                  {geoScore.percentage}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--muted)" }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${geoScore.percentage}%`, backgroundColor: "var(--accent)" }} />
              </div>
              <ul className="mt-4 space-y-2">
                {geoScore.checks.map((check) => (
                  <li key={check.key} className="flex items-center gap-2 text-xs"
                    style={{ color: check.passed ? "var(--foreground)" : "var(--muted-foreground)" }}>
                    <CheckCircle2 size={14} style={{ color: check.passed ? "oklch(0.55 0.16 150)" : "var(--border)" }} />
                    {check.label}
                  </li>
                ))}
              </ul>
            </Card>

            {/* SEO & Google Preview Card */}
            <Card>
              <CardHeader icon={Search} title="SEO" subtitle="Axtarış görünmə" />
              <div className="mt-4 space-y-3">
                <Field label="Meta title">
                  <input 
                    value={metaTitle} 
                    onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))}
                    placeholder="Meta başlığı daxil edin"
                    className={inputClass} 
                    style={inputStyle} 
                  />
                </Field>
                
                <Field label="Meta description">
                  <textarea 
                    rows={3} 
                    value={metaDescription} 
                    onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
                    placeholder="Meta təsviri daxil edin"
                    className="w-full rounded-xl border bg-surface p-3 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]" 
                    style={inputStyle} 
                  />
                </Field>

                {/* Google preview simulator */}
                <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
                  <div className="text-[10px] text-muted-foreground truncate">{siteConfig.url.replace(/^https?:\/\//, '').split(':')[0]} › companies › {companySlug || 'sirket'}</div>
                  <div className="mt-0.5 text-sm font-semibold leading-tight line-clamp-1" style={{ color: "oklch(0.4 0.15 260)" }}>
                    {metaTitle || name || 'Şirkət adı'}
                  </div>
                  <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                    {metaDescription || description || 'Meta təsvir burda görünür...'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit button */}
            <PrimaryButton 
              onClick={handleSave}
              disabled={isSaving || !name || !categoryId}
              className="h-12 w-full flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saxlanır...
                </>
              ) : (
                'Yadda saxla'
              )}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
