import { Resend } from "resend";
import { prisma } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createAndSendOTP(params: {
  identifier: string;
  toEmail: string;
  expiresInMs: number;
  subject: string;
  htmlBuilder: (otp: string) => string;
}): Promise<string> {
  const { identifier, toEmail, expiresInMs, subject, htmlBuilder } = params;

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const otp = generateOTP();
  const expires = new Date(Date.now() + expiresInMs);

  await prisma.verificationToken.create({
    data: { identifier, token: otp, expires }
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n🔑 [OTP DEV] ${identifier}: ${otp}\n`);
  }

  await resend.emails.send({
    from: "Encyclo <onboarding@resend.dev>",
    to: toEmail,
    subject,
    html: htmlBuilder(otp)
  });

  return otp;
}

export function otpEmailTemplate(opts: { heading: string; bodyText: string; otp: string; expiryMinutes: number }): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">${opts.heading}</h2>
      <p style="color: #6b7280; margin-bottom: 24px;">${opts.bodyText}</p>
      <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #111827;">${opts.otp}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Bu kod ${opts.expiryMinutes} dəqiqə ərzində etibarlıdır.</p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">Əgər siz bu sorğunu göndərməmisinizsə, bu emaili nəzərə almayın.</p>
    </div>
  `;
}
