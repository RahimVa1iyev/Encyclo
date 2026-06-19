import { redirect } from '@/lib/navigation';
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireSuperadminPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect({ href: "/login", locale: "az" });
    return;
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true }
  });

  if (profile?.role !== "superadmin") {
    redirect({ href: "/dashboard", locale: "az" });
    return;
  }
}
