import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireSuperadmin() {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true }
  });

  if (profile?.role !== "superadmin") {
    throw new Error("Unauthorized");
  }

  return user;
}
