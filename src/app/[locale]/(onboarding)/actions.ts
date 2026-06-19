
"use server";
import { withTranslation, getTranslation } from "@/lib/prisma-locale";


import { prisma } from "@/lib/db";
import { auth, unstable_update } from "@/lib/auth";

export async function getOnboardingDataAction(locale: string = "az") {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { emailVerified: true }
  });

  if (!profile?.emailVerified) {
    return { redirectTo: "/verify-email" as const };
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  const company = await prisma.company.findFirst({
    where: { owner_id: user.id },
    include: {
      translations: withTranslation(locale)
    }
  });

  return { categories, company };
}

export type OnboardingStep1Input = {
  companyId: string;
  categoryId: string;
  website: string;
  name: string;
  description: string;
  phone: string;
  address: string;
  taxId: string;
  email: string;
  foundingYear: string;
};

export async function updateOnboardingStep1Action(input: OnboardingStep1Input) {
  const {
    companyId, categoryId, website, name, description,
    phone, address, taxId, email, foundingYear
  } = input;
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  // Verify ownership
  const company = await prisma.company.findFirst({ where: { id: companyId, owner_id: user.id } });
  if (!company) throw new Error("Company not found or unauthorized");

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
      data: { 
        category_id: categoryId, 
        website, 
        phone: phone || null, 
        tax_id: taxId || null,
        email: email || null,
        founding_year: foundingYear ? parseInt(foundingYear, 10) : null
      }
    });

    const existingTranslation = await tx.companyTranslation.findFirst({
      where: { company_id: companyId, locale: "az" }
    });

    if (existingTranslation) {
      await tx.companyTranslation.update({
        where: { id: existingTranslation.id },
        data: { name, description, address: address || null }
      });
    } else {
      await tx.companyTranslation.create({
        data: {
          company_id: companyId,
          locale: "az",
          name,
          description,
          address: address || null
        }
      });
    }
  });

  return { success: true };
}

export async function updateCompanyLogoAction(companyId: string, logoUrl: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  const company = await prisma.company.findFirst({ where: { id: companyId, owner_id: user.id } });
  if (!company) throw new Error("Company not found or unauthorized");

  await prisma.company.update({
    where: { id: companyId },
    data: { logo_url: logoUrl }
  });

  return { success: true };
}

export async function finishOnboardingAction(companyId: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  const company = await prisma.company.findFirst({ where: { id: companyId, owner_id: user.id } });
  if (!company) throw new Error("Company not found or unauthorized");

  await prisma.company.update({
    where: { id: companyId },
    data: {
      onboarding_completed: true,
      status: "pending_review",
      submitted_at: new Date()
    }
  });

  await unstable_update({
    user: { onboarding_completed: true } as any
  });

  return { success: true };
}
