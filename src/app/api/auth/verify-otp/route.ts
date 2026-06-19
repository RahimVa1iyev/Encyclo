import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth, unstable_update } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });
    }

    const { otp } = await request.json();
    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: "Düzgün kod daxil edin" }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { email: true, emailVerified: true }
    });

    if (!profile) {
      return NextResponse.json({ error: "İstifadəçi tapılmadı" }, { status: 404 });
    }

    if (profile.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: profile.email,
        token: otp
      }
    });

    if (!token) {
      return NextResponse.json({ error: "Kod yanlışdır" }, { status: 400 });
    }

    if (token.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: profile.email, token: otp } }
      });
      return NextResponse.json({ error: "Kodun vaxtı keçib. Yeni kod tələb edin." }, { status: 400 });
    }

    // Email-i doğrulanmış işarələ
    await prisma.profile.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });

    // Token-i sil
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: profile.email, token: otp } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Doğrulama zamanı xəta baş verdi" }, { status: 500 });
  }
}
