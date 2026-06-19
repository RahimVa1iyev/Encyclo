"use server"

import { prisma } from "@/lib/db";
import { requireSuperadmin } from "@/lib/admin-auth";
import { withTranslation } from "@/lib/prisma-locale";
import { revalidatePath } from "next/cache";

export async function getPendingCompaniesAction(locale: string = "az") {
  await requireSuperadmin();

  const companies = await prisma.company.findMany({
    where: { status: "pending_review" },
    select: {
      id: true,
      slug: true,
      website: true,
      logo_url: true,
      phone: true,
      tax_id: true,
      email: true,
      founding_year: true,
      area_served: true,
      submitted_at: true,
      translations: withTranslation(locale),
      category: true,
      socialLinks: true,
    },
    orderBy: { submitted_at: "asc" }
  });

  return companies;
}

export async function approveCompanyAction(companyId: string) {
  const admin = await requireSuperadmin();

  await prisma.company.update({
    where: { id: companyId },
    data: {
      status: "active",
      reviewed_by: admin.id,
      reviewed_at: new Date(),
      review_notes: null
    }
  });

  revalidatePath("/admin/companies");
  return { success: true };
}

export async function requestChangesAction(companyId: string, notes: string) {
  const admin = await requireSuperadmin();

  if (!notes || notes.trim().length < 5) {
    throw new Error("Dəyişiklik səbəbi yazılmalıdır");
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      status: "needs_changes",
      reviewed_by: admin.id,
      reviewed_at: new Date(),
      review_notes: notes.trim()
    }
  });

  revalidatePath("/admin/companies");
  return { success: true };
}

export async function rejectCompanyAction(companyId: string, notes: string) {
  const admin = await requireSuperadmin();

  if (!notes || notes.trim().length < 5) {
    throw new Error("Rədd səbəbi yazılmalıdır");
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      status: "rejected",
      reviewed_by: admin.id,
      reviewed_at: new Date(),
      review_notes: notes.trim()
    }
  });

  revalidatePath("/admin/companies");
  return { success: true };
}

export async function suspendCompanyAction(companyId: string, notes: string) {
  const admin = await requireSuperadmin();

  if (!notes || notes.trim().length < 5) {
    throw new Error("Dayandırma səbəbi yazılmalıdır");
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      status: "suspended",
      reviewed_by: admin.id,
      reviewed_at: new Date(),
      review_notes: notes.trim()
    }
  });

  revalidatePath("/admin/companies");
  return { success: true };
}

export async function getCompanyDetailForReviewAction(companyId: string, locale: string = "az") {
  await requireSuperadmin();

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      translations: withTranslation(locale),
      category: true,
      socialLinks: true,
    }
  });

  if (!company) throw new Error("Şirkət tapılmadı");

  let owner = null;
  if (company.owner_id) {
    owner = await prisma.profile.findUnique({
      where: { id: company.owner_id },
      select: { email: true, name: true, created_at: true }
    });
  }

  const productCount = await prisma.product.count({
    where: { company_id: companyId }
  });

  return { company, owner, productCount };
}
