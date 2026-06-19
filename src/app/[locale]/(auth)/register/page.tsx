"use client";

import { useState, useMemo } from "react";
import { Link } from '@/lib/navigation';
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { signIn } from "next-auth/react";
import { slugify } from "@/lib/utils";
import { AuthLayout } from "@/components/auth/AuthLayout";

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
      
      const { checkCompanySlugExistsAction, createCompanyAfterRegisterAction } = await import('./actions');
      const slugExists = await checkCompanySlugExistsAction(companySlug);

      if (slugExists) {
        companySlug = companySlug + "-" + Math.floor(1000 + Math.random() * 9000);
      }

      // 2. Sign Up via API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, companyName, companySlug })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Qeydiyyat zamanı xəta baş verdi");

      const signInResult = await signIn("credentials", {
        redirect: true,
        callbackUrl: "/verify-email",
        email,
        password
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Qeydiyyat zamanı xəta baş verdi";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const registerFeatures = [
    {
      title: "ChatGPT, Perplexity və Google AI-da tapılın",
      description: "Süni intellekt axtarışlarında şirkətinizin və məhsullarınızın təbii şəkildə tapılmasını optimallaşdırın."
    },
    {
      title: "Müasir B2B SaaS profili",
      description: "Bütün fəaliyyət məlumatlarınızı və təsvirlərinizi bir peşəkar B2B panelində cəmləşdirin."
    },
    {
      title: "Süni İntellekt dəstəyi",
      description: "AI köməkçisi vasitəsilə profil məlumatlarınızı bir kliklə mükəmməl Azərbaycan dilində generasiya edin."
    }
  ];

  return (
    <AuthLayout
      title={
        <>
          Şirkətinizi gələcəyin axtarış sistemlərinə{" "}
          <span style={{ color: 'var(--accent)' }}>
            hazırlayın
          </span>
        </>
      }
      description="Encyclo ilə şirkət məlumatlarınızı GEO (Generative Engine Optimization) formatında qurun və süni intellekt axtarış motorlarında ön sırada yer alın."
      features={registerFeatures}
    >
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-10 text-center">
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
              className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2"
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
              className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
              placeholder="Acme Inc."
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2"
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
              className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
              placeholder="name@company.com"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2"
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
                className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 pr-11 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
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
                    {strengthColors.map((color: any, i: any) => (
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
              className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2"
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
                className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 pr-11 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
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
            <div className="text-red-500 text-sm bg-red-50/50 p-4 rounded-xl border border-red-100 flex items-center justify-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-xl px-4 py-3.5 text-sm font-bold transition-all shadow-sm active:scale-[0.98] hover:opacity-90 disabled:opacity-75 disabled:cursor-not-allowed"
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
              className="font-bold hover:text-foreground transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              Daxil olun
            </Link>
          </p>
      </div>
    </AuthLayout>
  );
}
