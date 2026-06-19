"use client";

import { useState, useMemo } from "react";
import { Link } from '@/lib/navigation';
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";



import { AuthLayout } from "@/components/auth/AuthLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) throw new Error("Giriş məlumatları yanlışdır");

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Giriş məlumatları yanlışdır";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginFeatures = [
    {
      title: "Sürətli idarəetmə",
      description: "Şirkət məlumatlarınızı anında yeniləyin və axtarış sistemlərində daha cəlbedici görünün."
    },
    {
      title: "Məzmun optimizasiyası",
      description: "Məhsul və xidmətlərinizi əlavə edərək, AI vasitəsilə ən yaxşı nəticə üçün optimallaşdırın."
    }
  ];

  return (
    <AuthLayout
      title={
        <>
          Yenidən{" "}
          <span style={{ color: 'var(--accent)' }}>
            xoş gəldiniz
          </span>
        </>
      }
      description="Şirkətinizin profilini idarə etmək, yeni məhsullar əlavə etmək və statistikaları izləmək üçün idarəetmə panelinə daxil olun."
      features={loginFeatures}
    >
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Xoş gəldiniz
          </h1>
          <p className="text-sm text-muted-foreground">
            Hesabınıza daxil olun
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
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
                autoComplete="current-password"
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
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium hover:underline transition-all"
                  style={{ color: 'var(--accent)' }}
                >
                  Şifrəni unutmusunuz?
                </Link>
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
                    Giriş edilir...
                  </span>
                ) : (
                  "Daxil ol"
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Hesabınız yoxdur?{" "}
            <Link
              href="/register"
              className="font-bold hover:text-foreground transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              Qeydiyyat
            </Link>
          </p>
      </div>
    </AuthLayout>
  );
}
