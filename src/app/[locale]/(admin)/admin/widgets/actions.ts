"use server"

import { requireSuperadmin } from "@/lib/admin-auth";

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateWidgetStatus(id: string, status: 'active' | 'blocked') {
  const user = await requireSuperadmin();

  await prisma.widgetDeployment.update({
    where: { id },
    data: { status, added_by: user.id }
  })

  revalidatePath('/admin/widgets')
}

export async function addWidgetDomain(company_id: string, domain: string, notes?: string) {
  const user = await requireSuperadmin();

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
