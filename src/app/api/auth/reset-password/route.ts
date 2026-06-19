import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, resetToken, newPassword } = await request.json();

    if (!email || !resetToken || !newPassword) {
      return NextResponse.json({ error: "Bütün sahələr tələb olunur" }, { status: 400 });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Şifrə ən azı 8 simvol olmalıdır" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const identifier = `RESET_TOKEN:${normalizedEmail}`;

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: { identifier, token: resetToken }
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Token yanlışdır və ya prosesi yenidən başlamalısınız" },
        { status: 400 }
      );
    }

    if (tokenRecord.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier, token: resetToken } }
      });
      return NextResponse.json(
        { error: "Sessiyanın vaxtı keçib. Prosesi yenidən başlayın." },
        { status: 400 }
      );
    }

    const user = await prisma.profile.findFirst({
      where: { 
        email: {
          equals: normalizedEmail,
          mode: "insensitive"
        }
      },
      select: { id: true }
    });

    if (!user) {
      // Bura nəzəri olaraq çatılmamalıdır (əvvəlki addımlarda email yoxlanılıb)
      return NextResponse.json({ error: "Xəta baş verdi" }, { status: 400 });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    const currentProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { emailVerified: true }
    });

    await prisma.profile.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        ...(currentProfile?.emailVerified ? {} : { emailVerified: new Date() })
      }
    });

    // Token-i sil (bir dəfəlik istifadə)
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier, token: resetToken } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Xəta baş verdi" }, { status: 500 });
  }
}
