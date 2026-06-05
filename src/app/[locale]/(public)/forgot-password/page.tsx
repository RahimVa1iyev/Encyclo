"use client";

import { getSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { Link } from '@/lib/navigation';
import { Loader2, Check, ArrowLeft } from "lucide-react";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement NextAuth custom reset flow
      const resetError = null; // await fetch("/api/auth/reset-password"(email, {
      //   redirectTo: `${window.location.origin}/reset-password`,
      // });

      if (resetError) throw resetError;

      setIsSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Şifrə sıfırlama linki göndərilərkən xəta baş verdi";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col justify-center py-20 px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface p-8 card-hover">
          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight mb-2">
                  Şifrəni bərpa et
                </h1>
                <p className="text-sm text-muted-foreground">
                  Email ünvanınızı daxil edin və sizə şifrə bərpa linki göndərək
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleResetPassword}>
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
                        Göndərilir...
                      </span>
                    ) : (
                      "Link göndər"
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div
                className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6 text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Check className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-3">
                Link göndərildi
              </h1>
              <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                Şifrənizi bərpa etmək üçün təlimatlar <strong>{email}</strong> ünvanına göndərildi. Zəhmət olmasa emailinizi yoxlayın.
              </p>
              <div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  <ArrowLeft className="h-4 w-4" /> Girişə qayıt
                </Link>
              </div>
            </div>
          )}

          {!isSubmitted && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              <Link
                href="/login"
                className="font-bold hover:underline transition-colors inline-flex items-center gap-2"
                style={{ color: 'var(--accent)' }}
              >
                <ArrowLeft className="h-4 w-4" /> Girişə qayıt
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
