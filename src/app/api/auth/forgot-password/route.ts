import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit-redis";
import { createAndSendOTP, otpEmailTemplate } from "@/lib/otp";
import { OTP_EXPIRY_MS } from "@/lib/auth-constants";

const ipRateLimiter = createRateLimiter(5, 15 * 60);
const emailRateLimiter = createRateLimiter(5, 15 * 60);

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success: ipAllowed } = await ipRateLimiter.limit(ip);
  if (!ipAllowed) {
    return NextResponse.json(
      { error: "Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd edin." },
      { status: 429 }
    );
  }

  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email tələb olunur" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Eyni IP-dən eyni email üçün də əlavə rate limit (dəqiq email-yönlü spam qarşısı)
    const emailRateLimitKey = `forgot-pw:${normalizedEmail}`;
    const { success: emailAllowed } = await emailRateLimiter.limit(emailRateLimitKey);
    if (!emailAllowed) {
      return NextResponse.json(
        { error: "Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd edin." },
        { status: 429 }
      );
    }

    const user = await prisma.profile.findFirst({
      where: { 
        email: {
          equals: normalizedEmail,
          mode: "insensitive"
        }
      },
      select: { id: true, email: true }
    });

    const genericSuccessResponse = NextResponse.json({
      success: true,
      message: "Əgər bu email qeydiyyatlıdırsa, doğrulama kodu göndərildi."
    });

    if (!user) {
      return genericSuccessResponse;
    }

    await createAndSendOTP({
      identifier: `RESET:${normalizedEmail}`,
      toEmail: normalizedEmail,
      expiresInMs: OTP_EXPIRY_MS, // 10 dəqiqə
      subject: "Encyclo — Şifrə bərpa kodu",
      htmlBuilder: (otp) => otpEmailTemplate({
        heading: "Şifrə bərpa kodu",
        bodyText: "Şifrənizi bərpa etmək üçün bu kodu daxil edin:",
        otp,
        expiryMinutes: 10
      })
    });

    return genericSuccessResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    // Xəta halında da generic mesaj — daxili detalları açma
    return NextResponse.json(
      { error: "Xəta baş verdi. Yenidən cəhd edin." },
      { status: 500 }
    );
  }
}
