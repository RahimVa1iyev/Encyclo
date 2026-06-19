"use client";

import { useRef, ClipboardEvent, KeyboardEvent } from "react";

interface OtpInputProps {
  otp: string[];
  setOtp: (otp: string[]) => void;
  error?: string | null;
  disabled?: boolean;
  onComplete?: (code: string) => void;
}

export function OtpInput({ otp, setOtp, error, disabled, onComplete }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Otomatik sonrakı xanaya keçid
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Tamamlandıqda auto-submit üçün onComplete çağırılır
    if (newOtp.every(d => d !== "") && newOtp.join("").length === 6) {
      onComplete?.(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      
      if (pasted.length === 6) {
        onComplete?.(pasted);
      } else {
        inputRefs.current[pasted.length]?.focus();
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={el => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleInput(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          disabled={disabled}
          className="w-12 h-14 text-center text-xl font-black rounded-xl border border-border bg-background outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
          style={{ borderColor: error ? "#ef4444" : digit ? "var(--accent)" : "var(--border)" }}
        />
      ))}
    </div>
  );
}
