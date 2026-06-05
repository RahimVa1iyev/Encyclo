"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function checkAdminAuthAction() {
  const session = await auth();
  const user = session?.user;
  if (!user) return { isAuthorized: false };

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true }
  });

  if (profile?.role === "superadmin") {
    return { isAuthorized: true };
  }

  return { isAuthorized: false };
}
