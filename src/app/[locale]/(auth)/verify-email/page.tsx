"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/lib/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Mail, RefreshCw, CheckCircle } from "lucide-react";
import { OtpInput } from "@/components/ui/otp-input";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OtpFormStep } from "@/components/auth/OtpFormStep";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const { update } = useSession();

  useEffect(() => {
    // Səhifə açılında OTP göndər
    sendOTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    setIsSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Email artıq doğrulanıb") {
          await update({ user: { emailVerified: true } });
          router.push("/onboarding");
          return;
        }
        setError(data.error);
        return;
      }
      setCountdown(60); // 60 saniyə gözlə
    } catch {
      setError("Kod göndərilmədi. Yenidən cəhd edin.");
    } finally {
      setIsSending(false);
    }
  };

  const verifyOTP = async (code: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: code })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setOtp(["", "", "", "", "", ""]);
        return;
      }
      
      await update({ user: { emailVerified: true } });
      setSuccess(true);
      setTimeout(() => {
        router.push("/onboarding");
      }, 1500);
    } catch {
      setError("Xəta baş verdi. Yenidən cəhd edin.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title={
          <>
            Email <span style={{ color: "var(--accent)" }}>doğrulandı</span>
          </>
        }
        description="Təbriklər, email ünvanınız uğurla təsdiqləndi!"
      >
        <div className="w-full max-w-sm mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Təbriklər!</h1>
            <p className="text-muted-foreground">Sistemə yönləndirilirsiniz...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={
        <>
          Emailinizi <span style={{ color: "var(--accent)" }}>doğrulayın</span>
        </>
      }
      description="Qeydiyyatı tamamlamaq üçün email ünvanınıza göndərilmiş 6 rəqəmli kodu daxil edin."
    >
      <div className="w-full max-w-sm mx-auto">
        <OtpFormStep
          icon={<Mail className="h-7 w-7" />}
          title="Doğrulama Kodu"
          description="Kodu aşağıya daxil edin"
          otp={otp}
          setOtp={setOtp}
          error={error}
          disabled={isVerifying}
          onComplete={(code) => verifyOTP(code)}
        >
          {/* Yükləmə */}
          {isVerifying && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Yoxlanılır...
            </div>
          )}

          {/* Yenidən göndər */}
          <div className="text-center mt-6">
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Yeni kod {countdown} saniyə sonra tələb edilə bilər
              </p>
            ) : (
              <button
                onClick={sendOTP}
                disabled={isSending}
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline disabled:opacity-50"
                style={{ color: "var(--accent)" }}
              >
                {isSending ? (
                  <><Loader2 className="h-3 w-3 animate-spin" /> Göndərilir...</>
                ) : (
                  <><RefreshCw className="h-3 w-3" /> Yeni kod tələb et</>
                )}
              </button>
            )}
          </div>
        </OtpFormStep>
      </div>
    </AuthLayout>
  );
}
