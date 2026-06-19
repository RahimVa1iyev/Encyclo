import React from "react";
import { OtpInput } from "@/components/ui/otp-input";

interface OtpFormStepProps {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  otp: string[];
  setOtp: (otp: string[]) => void;
  error: string | null;
  disabled: boolean;
  onComplete: (code: string) => void;
  children?: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

export function OtpFormStep({
  icon,
  title,
  description,
  otp,
  setOtp,
  error,
  disabled,
  onComplete,
  children,
  onSubmit,
}: OtpFormStepProps) {
  const content = (
    <>
      <div className="mb-10 text-center">
        <div
          className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6 text-white shadow-md"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {icon}
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-5">
        <OtpInput
          otp={otp}
          setOtp={setOtp}
          error={error}
          disabled={disabled}
          onComplete={onComplete}
        />

        {error && (
          <div className="text-red-500 text-sm bg-red-50/50 p-4 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {children}
      </div>
    </>
  );

  if (onSubmit) {
    return <form onSubmit={onSubmit}>{content}</form>;
  }

  return <div>{content}</div>;
}
