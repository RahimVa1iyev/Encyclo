"use server";

import { prisma } from "@/lib/db";

export async function submitContactFormAction(productId: string, companyId: string, name: string, email: string, message: string) {
  const newLead = await prisma.lead.create({
    data: {
      product_id: productId,
      company_id: companyId,
      name: name,
      email: email,
      message: message || null
    }
  });

  return newLead;
}
