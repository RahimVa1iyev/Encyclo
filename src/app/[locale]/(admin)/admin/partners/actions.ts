"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

import { requireSuperadmin } from "@/lib/admin-auth";

export async function addPartnerSite(name: string, domain: string, category_id?: string) {
  await requireSuperadmin()

  const apiKey = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '').substring(0, 16);

  await prisma.partnerSite.create({
    data: {
      name,
      domain,
      api_key: apiKey,
      status: 'active',
      category_id: category_id || null
    }
  })

  revalidatePath('/admin/partners')
}

export async function addCompanyToSite(partner_site_id: string, company_id: string, priority: number = 0) {
  await requireSuperadmin()

  await prisma.partnerSiteCompany.create({
    data: {
      partner_site_id,
      company_id,
      priority
    }
  })

  revalidatePath('/admin/partners')
}

export async function removeCompanyFromSite(partner_site_id: string, company_id: string) {
  await requireSuperadmin()

  await prisma.partnerSiteCompany.deleteMany({
    where: {
      partner_site_id,
      company_id
    }
  })

  revalidatePath('/admin/partners')
}

export async function updatePartnerSiteStatus(id: string, status: 'active' | 'suspended') {
  await requireSuperadmin()

  await prisma.partnerSite.update({
    where: { id },
    data: { status }
  })

  revalidatePath('/admin/partners')
}
