import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
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
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { email: true, emailVerified: true }
    });

    if (!profile) {
      return NextResponse.json({ error: "İstifadəçi tapılmadı" }, { status: 404 });
    }

    const emailRateLimitKey = `send-otp:${profile.email}`;
    const { success: emailAllowed } = await emailRateLimiter.limit(emailRateLimitKey);
    if (!emailAllowed) {
      return NextResponse.json(
        { error: "Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd edin." },
        { status: 429 }
      );
    }

    if (profile.emailVerified) {
      return NextResponse.json({ error: "Email artıq doğrulanıb" }, { status: 400 });
    }

    try {
      await createAndSendOTP({
        identifier: profile.email,
        toEmail: profile.email,
        expiresInMs: OTP_EXPIRY_MS, // 10 dəqiqə
        subject: "Encyclo — Email doğrulama kodu",
        htmlBuilder: (otp) => otpEmailTemplate({
          heading: "Email doğrulama",
          bodyText: "Aşağıdakı kodu Encyclo-da daxil edin:",
          otp,
          expiryMinutes: 10
        })
      });
    } catch (sendError) {
      console.error("Resend throws error:", sendError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Kod göndərilmədi" }, { status: 500 });
  }
}
