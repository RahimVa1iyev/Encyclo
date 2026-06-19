import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { RESET_TOKEN_EXPIRY_MS } from "@/lib/auth-constants";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp || typeof otp !== "string" || otp.length !== 6) {
      return NextResponse.json({ error: "Düzgün məlumat daxil edin" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const identifier = `RESET:${normalizedEmail}`;

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: { identifier, token: otp }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Kod yanlışdır" }, { status: 400 });
    }

    if (tokenRecord.expires < new Date()) {
      try {
        await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token: otp } }
        });
      } catch {}
      return NextResponse.json(
        { error: "Kodun vaxtı keçib. Yeni kod tələb edin." },
        { status: 400 }
      );
    }

    try {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier, token: otp } }
      });
    } catch {
      return NextResponse.json(
        { error: "Bu kod artıq istifadə olunub. Yeni kod tələb edin." },
        { status: 400 }
      );
    }

    // Köhnə reset token-ləri təmizlə (əgər varsa)
    const resetTokenIdentifier = `RESET_TOKEN:${normalizedEmail}`;
    await prisma.verificationToken.deleteMany({
      where: { identifier: resetTokenIdentifier }
    });

    // Yeni, kriptoqrafik təsadüfi resetToken yarat
    const resetToken = randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS); // 5 dəqiqə

    await prisma.verificationToken.create({
      data: {
        identifier: resetTokenIdentifier,
        token: resetToken,
        expires: resetExpires
      }
    });

    return NextResponse.json({ success: true, resetToken });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    return NextResponse.json({ error: "Xəta baş verdi" }, { status: 500 });
  }
}
