"use client";

import { useState } from "react";
import { Link, useRouter } from '@/lib/navigation';
import { Loader2, Check, ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OtpInput } from "@/components/ui/otp-input";
import { OtpFormStep } from "@/components/auth/OtpFormStep";

type Step = "email" | "otp" | "newPassword" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Xəta baş verdi");
        return;
      }
      setStep("otp");
    } catch {
      setError("Xəta baş verdi. Yenidən cəhd edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault();
    const code = codeOverride || otp.join("");
    if (code.length !== 6) {
      setError("6 rəqəmli kodu tam daxil edin");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kod yanlışdır");
        return;
      }
      setResetToken(data.resetToken);
      setStep("newPassword");
    } catch {
      setError("Xəta baş verdi. Yenidən cəhd edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Şifrə ən azı 8 simvol olmalıdır");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Şifrələr uyğun gəlmir");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Xəta baş verdi");
        return;
      }
      setStep("done");
    } catch {
      setError("Xəta baş verdi. Yenidən cəhd edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      title: "Təhlükəsizlik",
      description: "Şifrənizi güclü və təhlükəsiz saxlayın."
    },
    {
      title: "Sürətli bərpa",
      description: "Saniyələr ərzində yeni şifrə təyin edin və idarə panelinə daxil olun."
    }
  ];

  const getTitle = () => {
    if (step === "email" || step === "otp") return <>Şifrəni <span style={{ color: 'var(--accent)' }}>bərpa et</span></>;
    if (step === "newPassword") return <>Yeni şifrə <span style={{ color: 'var(--accent)' }}>təyin edin</span></>;
    return <>Şifrəniz <span style={{ color: 'var(--accent)' }}>yeniləndi</span></>;
  };

  const getDescription = () => {
    if (step === "email") return "Hesabınıza girişi bərpa etmək üçün qeydiyyatdan keçdiyiniz email ünvanını daxil edin.";
    if (step === "otp") return "Email ünvanınıza göndərdiyimiz təhlükəsizlik kodunu daxil edin.";
    if (step === "newPassword") return "Hesabınız üçün yeni və daha güclü bir şifrə təyin edin.";
    return "Şifrəniz uğurla dəyişdirildi. İndi yeni şifrənizlə sistemə daxil ola bilərsiniz.";
  };

  return (
    <AuthLayout
      title={getTitle()}
      description={getDescription()}
      features={features}
    >
      <div className="w-full max-w-sm mx-auto">
        {step === "email" && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-black tracking-tight mb-2">Şifrəni bərpa et</h1>
              <p className="text-sm text-muted-foreground">
                Email ünvanınızı daxil edin və sizə doğrulama kodu göndərək
              </p>
            </div>
            <form className="space-y-5" onSubmit={handleSendOTP}>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
                  Email ünvanı
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
                  placeholder="name@company.com"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm bg-red-50/50 p-4 rounded-xl border border-red-100 text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-xl px-4 py-3.5 text-sm font-bold transition-all shadow-sm active:scale-[0.98] hover:opacity-90 disabled:opacity-75 disabled:cursor-not-allowed text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Kod göndər"}
              </button>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <OtpFormStep
              icon={<KeyRound className="h-8 w-8" />}
              title="Kodu daxil edin"
              description={
                <>
                  <strong>{email}</strong> ünvanına göndərilən 6 rəqəmli kodu yazın
                </>
              }
              otp={otp}
              setOtp={setOtp}
              error={error}
              disabled={isLoading}
              onComplete={(code) => handleVerifyOTP(undefined, code)}
              onSubmit={handleVerifyOTP}
            >
              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className="flex w-full justify-center rounded-xl px-4 py-3.5 text-sm font-bold transition-all shadow-sm active:scale-[0.98] hover:opacity-90 disabled:opacity-75 disabled:cursor-not-allowed text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Doğrula"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setError(null); }}
                className="w-full text-center text-sm font-semibold hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Email-i dəyişmək istəyirsiniz?
              </button>
            </OtpFormStep>
          </div>
        )}

        {step === "newPassword" && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-black tracking-tight mb-2">Yeni şifrə</h1>
              <p className="text-sm text-muted-foreground">Yeni şifrənizi daxil edin</p>
            </div>
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
                  Yeni şifrə
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 pr-11 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
                    placeholder="Ən azı 8 simvol"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 rounded-r-xl text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
                  Şifrəni təkrarla
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 pr-11 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
                    placeholder="Şifrəni yenidən daxil edin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 rounded-r-xl text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm bg-red-50/50 p-4 rounded-xl border border-red-100 text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="flex w-full justify-center rounded-xl px-4 py-3.5 text-sm font-bold transition-all shadow-sm active:scale-[0.98] hover:opacity-90 disabled:opacity-75 disabled:cursor-not-allowed text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Şifrəni yenilə"}
              </button>
            </form>
          </div>
        )}

        {step === "done" && (
          <div className="animate-in zoom-in duration-300 text-center py-6">
            <div
              className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6 text-white shadow-md"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Check className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-3">Şifrəniz yeniləndi</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Yeni şifrənizlə daxil ola bilərsiniz.
            </p>
            <Link
              href="/login"
              className="flex w-full justify-center rounded-xl px-4 py-3.5 text-sm font-bold transition-all shadow-sm active:scale-[0.98] hover:opacity-90 text-white gap-2 items-center"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Daxil ol
            </Link>
          </div>
        )}

        {step !== "done" && (
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
    </AuthLayout>
  );
}
