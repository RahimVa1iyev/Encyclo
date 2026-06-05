"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateWidgetStatus(id: string, status: 'active' | 'blocked') {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify superadmin role
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true }
  })

  if (profile?.role !== "superadmin") {
    throw new Error("Unauthorized")
  }

  await prisma.widgetDeployment.update({
    where: { id },
    data: { status, added_by: user.id }
  })

  revalidatePath('/admin/widgets')
}

export async function addWidgetDomain(company_id: string, domain: string, notes?: string) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify superadmin role
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true }
  })

  if (profile?.role !== "superadmin") {
    throw new Error("Unauthorized")
  }

  await prisma.widgetDeployment.create({
    data: {
      company_id,
      domain,
      status: 'active',
      notes,
      added_by: user.id
    }
  })

  revalidatePath('/admin/widgets')
}
