"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function checkCompanySlugExistsAction(slug: string) {
  const existing = await prisma.company.findUnique({
    where: { slug }
  });
  return !!existing;
}

export async function createCompanyAfterRegisterAction(slug: string, name: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  const company = await prisma.company.create({
    data: {
      slug,
      owner_id: user.id,
      status: "draft"
    }
  });

  await prisma.companyTranslation.create({
    data: {
      company_id: company.id,
      locale: "az",
      name: name
    }
  });

  return { success: true };
}
