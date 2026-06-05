
"use server";
import { withTranslation, getTranslation } from "@/lib/prisma-locale";


import { prisma } from "@/lib/db";
import { auth, unstable_update } from "@/lib/auth";

export async function getOnboardingDataAction(locale: string = "az") {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

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

export async function updateOnboardingStep1Action(companyId: string, categoryId: string, website: string, name: string, description: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  // Verify ownership
  const company = await prisma.company.findFirst({ where: { id: companyId, owner_id: user.id } });
  if (!company) throw new Error("Company not found or unauthorized");

  await prisma.company.update({
    where: { id: companyId },
    data: { category_id: categoryId, website }
  });

  // Update translation
  const existingTranslation = await prisma.companyTranslation.findFirst({
    where: { company_id: companyId, locale: "az" }
  });

  if (existingTranslation) {
    await prisma.companyTranslation.update({
      where: { id: existingTranslation.id },
      data: { name, description }
    });
  } else {
    await prisma.companyTranslation.create({
      data: {
        company_id: companyId,
        locale: "az",
        name,
        description
      }
    });
  }

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
    data: { onboarding_completed: true, status: "active" }
  });

  await unstable_update({
    user: { onboarding_completed: true } as any
  });

  return { success: true };
}
