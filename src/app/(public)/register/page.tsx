"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

function getPasswordStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0;
  if (pwd.length < 8) return 1;
  let score = 1;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const passwordStrength = getPasswordStrength(password);

  const strengthLabel =
    passwordStrength === 1
      ? "Zəif"
      : passwordStrength === 2
        ? "Orta"
        : passwordStrength === 3
          ? "Güclü"
          : passwordStrength === 4
            ? "Çox Güclü"
            : "";

  const strengthColors = [
    passwordStrength >= 1 ? "var(--accent)" : "var(--border)",
    passwordStrength >= 2 ? "var(--accent)" : "var(--border)",
    passwordStrength >= 3 ? "var(--accent)" : "var(--border)",
    passwordStrength >= 4 ? "var(--accent)" : "var(--border)",
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validations
    if (password.length < 8) {
      setError("Şifrə minimum 8 simvol olmalıdır");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifrələr uyğun gəlmir");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Prepare Slug
      let companySlug = slugify(companyName);
      const { data: existingSlug } = await supabase
        .from("companies")
        .select("id")
        .eq("slug", companySlug)
        .maybeSingle();

      if (existingSlug) {
        companySlug = companySlug + "-" + Math.floor(1000 + Math.random() * 9000);
      }

      // 2. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { onboarding_completed: false },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("İstifadəçi məlumatları alınmadı");

      // 3. Create Company & Translation safely
      let companyData;
      try {
        const { data: cData, error: companyError } = await supabase
          .from("companies")
          .insert({
            slug: companySlug,
            owner_id: authData.user.id,
            status: "draft",
          })
          .select()
          .single();

        if (companyError || !cData) {
          throw companyError ?? new Error("Şirkət yaradılmadı");
        }
        companyData = cData;
      } catch (err: unknown) {
        throw new Error(
          "Hesab yaradıldı amma şirkət profili qurulmadı. Zəhmət olmasa dəstəklə əlaqə saxlayın."
        );
      }

      try {
        const { error: translationError } = await supabase
          .from("company_translations")
          .insert({
            company_id: companyData.id,
            locale: "az",
            name: companyName,
          });

        if (translationError) throw translationError;
      } catch (err: unknown) {
        throw new Error(
          "Hesab yaradıldı amma şirkət profili qurulmadı. Zəhmət olmasa dəstəklə əlaqə saxlayın."
        );
      }

      window.location.href = "/onboarding";
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Qeydiyyat zamanı xəta baş verdi";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col lg:grid lg:grid-cols-2 items-center justify-center px-6 py-12 lg:px-8 gap-12 max-w-6xl mx-auto w-full">
      {/* GEO Value Proposition Block */}
      <div className="flex flex-col justify-center flex-1 max-w-lg text-left">
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-[1.15]">
          Şirkətinizi gələcəyin axtarış sistemlərinə{" "}
          <span style={{ color: 'var(--accent)' }}>
            hazırlayın
          </span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
          Encyclo ilə şirkət məlumatlarınızı GEO (Generative Engine Optimization)
          formatında qurun və süni intellekt axtarış motorlarında ön sırada
          yer alın.
        </p>
        <ul className="space-y-6">
          <li className="flex items-start gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)' }}
            >
              <Check className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-base">
                ChatGPT, Perplexity və Google AI-da tapılın
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Süni intellekt axtarışlarında şirkətinizin və məhsullarınızın
                təbii şəkildə tapılmasını optimallaşdırın.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)' }}
            >
              <Check className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-base">
                Müasir B2B SaaS profili
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Bütün fəaliyyət məlumatlarınızı və təsvirlərinizi bir peşəkar B2B
                panelində cəmləşdirin.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)' }}
            >
              <Check className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-base">
                Süni İntellekt dəstəyi
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                AI köməkçisi vasitəsilə profil məlumatlarınızı bir kliklə mükəmməl
                Azərbaycan dilində generasiya edin.
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* Register Form */}
      <div className="w-full sm:max-w-md shrink-0">
        <div className="rounded-3xl border border-border bg-surface p-8 card-hover">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight mb-2">
              Hesab yaradın
            </h2>
            <p className="text-sm text-muted-foreground">
              Şirkətinizi Encyclo-da yerləşdirin
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Company Name */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2"
              >
                Şirkət adı
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
                placeholder="Acme Inc."
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2"
              >
                Email ünvanı
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
                placeholder="name@company.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2"
              >
                Şifrə
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-background pl-3 pr-11 py-2.5 text-sm outline-none focus:border-accent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 rounded-r-lg text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {strengthColors.map((color, i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-xs mt-1 font-semibold"
                    style={{ color: passwordStrength >= 3 ? 'var(--accent)' : 'var(--muted-foreground)' }}
                  >
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2"
              >
                Şifrəni təsdiqlə
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-background pl-3 pr-11 py-2.5 text-sm outline-none focus:border-accent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 rounded-r-lg text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50/50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold btn-press transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Hesab yaradılır...
                  </span>
                ) : (
                  "Qeydiyyatdan keç"
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Hesabınız var?{" "}
            <Link
              href="/login"
              className="font-bold hover:underline transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              Daxil olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
