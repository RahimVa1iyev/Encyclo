
"use server";
import { withTranslation, getTranslation } from "@/lib/prisma-locale";


import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getDashboardLayoutData(locale: string = "az") {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  const company = await prisma.company.findFirst({
    where: { owner_id: user.id },
    select: {
      id: true,
      status: true,
      review_notes: true,
      translations: { ...withTranslation(locale), select: { name: true } }
    }
  });

  if (!company) return null;

  const leadsCount = await prisma.lead.count({
    where: {
      company_id: company.id,
      status: 'new'
    }
  });

  return {
    companyName: company.translations[0]?.name || null,
    newLeadsCount: leadsCount,
    companyStatus: company.status,
    reviewNotes: company.review_notes
  };
}

export async function getDashboardPageData(locale: string = "az") {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  const company = await prisma.company.findFirst({
    where: { owner_id: user.id },
    select: { id: true }
  });

  if (!company) return { company: null, allProducts: [], faqs: [] };

  const allProducts = await prisma.product.findMany({
    where: { company_id: company.id },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      status: true,
      created_at: true,
      slug: true,
      images: true,
      views: true,
      translations: withTranslation(locale)
    }
  });

  const productIds = allProducts.map((p: any) => p.id);
  const faqs = await prisma.forumPost.findMany({
    where: {
      product_id: { in: productIds },
      is_faq: true
    },
    select: { product_id: true }
  });

  return { company, allProducts, faqs };
}

export async function getCompanyProfileData(locale: string = "az") {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  const [company, categories] = await Promise.all([
    prisma.company.findFirst({
      where: { owner_id: user.id },
      include: {
        translations: withTranslation(locale),
        category: true,
        socialLinks: true
      }
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  return { company, categories };
}

export async function updateCompanyProfile(companyId: string, payload: any) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  const company = await prisma.company.findFirst({
    where: { id: companyId, owner_id: user.id }
  });
  if (!company) throw new Error("Company not found or unauthorized");

  await prisma.company.update({
    where: { id: companyId },
    data: {
      category_id: payload.categoryId,
      website: payload.website,
      logo_url: payload.logo_url,
      phone: payload.phone,
      email: payload.email,
      founding_year: payload.founding_year,
      area_served: payload.area_served,
    }
  });

  const existingTrans = await prisma.companyTranslation.findFirst({
    where: { company_id: companyId, locale: 'az' }
  });
  
  if (existingTrans) {
    await prisma.companyTranslation.update({
      where: { id: existingTrans.id },
      data: {
        name: payload.name,
        description: payload.description,
        address: payload.address,
        meta_title: payload.metaTitle,
        meta_description: payload.metaDescription
      }
    });
  } else {
    await prisma.companyTranslation.create({
      data: {
        company_id: companyId,
        locale: 'az',
        name: payload.name,
        description: payload.description,
        address: payload.address,
        meta_title: payload.metaTitle,
        meta_description: payload.metaDescription
      }
    });
  }

  if (payload.platformsToSave && payload.platformsToSave.length > 0) {
    for (const link of payload.platformsToSave) {
      const existingLink = await prisma.companySocialLink.findFirst({
        where: { company_id: companyId, platform: link.platform }
      });
      if (existingLink) {
        await prisma.companySocialLink.update({
          where: { id: existingLink.id },
          data: { url: link.url }
        });
      } else {
        await prisma.companySocialLink.create({
          data: {
            company_id: companyId,
            platform: link.platform,
            url: link.url
          }
        });
      }
    }
  }

  if (payload.emptyPlatforms && payload.emptyPlatforms.length > 0) {
    const toDelete = await prisma.companySocialLink.findMany({
      where: { company_id: companyId, platform: { in: payload.emptyPlatforms } }
    });
    for (const link of toDelete) {
      await prisma.companySocialLink.delete({ where: { id: link.id } });
    }
  }

  return { success: true };
}

export async function getProductsData(locale: string = "az") {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  const company = await prisma.company.findFirst({
    where: { owner_id: user.id },
    select: { id: true }
  });
  if (!company) return [];

  const products = await prisma.product.findMany({
    where: { company_id: company.id },
    orderBy: { created_at: 'desc' },
    include: { translations: withTranslation(locale) }
  });

  return products;
}

export async function updateProductStatus(productId: string, newStatus: string) {
  await prisma.product.update({
    where: { id: productId },
    data: { status: newStatus }
  });
  return { success: true };
}

export async function deleteProductAction(productId: string) {
  await prisma.forumPost.deleteMany({ where: { product_id: productId } });
  await prisma.lead.deleteMany({ where: { product_id: productId } });
  await prisma.productTranslation.deleteMany({ where: { product_id: productId } });
  await prisma.product.delete({ where: { id: productId } });
  return { success: true };
}

export async function getAddContentData(locale: string = "az") {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  const company = await prisma.company.findFirst({
    where: { owner_id: user.id },
    include: { translations: withTranslation(locale) }
  });
  if (!company) return { company: null };

  const subscription = await prisma.subscription.findFirst({
    where: { company_id: company.id, status: 'active' },
    select: { plan: true }
  });

  const productCount = await prisma.product.count({
    where: { company_id: company.id }
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return { company, planId: subscription?.plan || 'starter', productCount, categories };
}

export async function createProductAction(companyId: string, productData: any, translations: any[]) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  const company = await prisma.company.findFirst({
    where: { id: companyId, owner_id: user.id }
  });
  if (!company) throw new Error("Unauthorized");

  const product = await prisma.product.create({
    data: {
      ...productData,
      company_id: companyId
    }
  });

  for (const t of translations) {
    await prisma.productTranslation.create({
      data: {
        ...t,
        product_id: product.id
      }
    });
  }

  return { success: true, slug: product.slug, productId: product.id };
}

export async function getEditProductPageData(productId: string, locale: string = "az") {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  const company = await prisma.company.findFirst({
    where: { owner_id: user.id },
    select: {
      id: true,
      phone: true,
      email: true,
      translations: { ...withTranslation(locale), select: { name: true } }
    }
  });

  if (!company) return null;

  const product = await prisma.product.findFirst({
    where: { id: productId, company_id: company.id },
    include: { translations: withTranslation(locale) }
  });

  if (!product) return null;

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return { company, product, categories };
}

export async function updateFullProductAction(productId: string, productData: any, translations: any[]) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  const existingProduct = await prisma.product.findFirst({
    where: { id: productId },
    include: { company: true }
  });

  if (!existingProduct || existingProduct.company?.owner_id !== user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.product.update({
    where: { id: productId },
    data: productData
  });

  // Delete all translations and re-insert
  await prisma.productTranslation.deleteMany({
    where: { product_id: productId }
  });

  for (const t of translations) {
    await prisma.productTranslation.create({
      data: {
        ...t,
        product_id: productId
      }
    });
  }

  return { success: true };
}

export async function checkProductSlugExists(companyId: string, slug: string) {
  const existing = await prisma.product.findFirst({
    where: { company_id: companyId, slug }
  });
  return !!existing;
}

export async function getForumData(locale: string = "az") {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  const company = await prisma.company.findFirst({
    where: { owner_id: user.id },
    select: { id: true }
  });
  if (!company) return null;

  const productsData = await prisma.product.findMany({
    where: { company_id: company.id },
    orderBy: { created_at: 'desc' },
    include: { translations: withTranslation(locale) }
  });

  const productIds = productsData.map((p: any) => p.id);
  const faqData = await prisma.forumPost.findMany({
    where: {
      product_id: { in: productIds },
      is_faq: true
    },
    orderBy: { created_at: 'desc' },
    select: { id: true, question: true, content: true, created_at: true, product_id: true }
  });

  return { productsData, faqData };
}

export async function addFAQAction(productId: string, question: string, answer: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  const newFaq = await prisma.forumPost.create({
    data: {
      product_id: productId,
      user_id: user.id,
      content: answer,
      question: question,
      is_faq: true
    },
    select: { id: true, question: true, content: true, created_at: true }
  });

  return newFaq;
}

export async function deleteFAQAction(faqId: string) {
  await prisma.forumPost.delete({ where: { id: faqId } });
  return { success: true };
}

export async function editFAQAction(faqId: string, question: string, answer: string) {
  await prisma.forumPost.update({
    where: { id: faqId },
    data: { question, content: answer }
  });
  return { success: true };
}

export async function saveMultipleFAQsAction(productId: string, faqs: any[]) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  const dataToInsert = faqs.map((faq: any) => ({
    product_id: productId,
    user_id: user.id,
    content: faq.answer,
    question: faq.question,
    is_faq: true
  }));

  // Prisma createMany does not return the created records in a way we can get IDs for Postgres without workarounds,
  // but since we need the IDs back, let's insert them one by one or fetch them after.
  // Actually, we can use a transaction.
  const createdFaqs = await prisma.$transaction(
    dataToInsert.map((data: any) => prisma.forumPost.create({
      data,
      select: { id: true, question: true, content: true, created_at: true, product_id: true }
    }))
  );

  return createdFaqs;
}

export async function getAIContentProductsData(locale: string = "az") {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  const company = await prisma.company.findFirst({
    where: { owner_id: user.id },
    select: { id: true }
  });
  if (!company) return null;

  const productsData = await prisma.product.findMany({
    where: { company_id: company.id },
    orderBy: { created_at: 'desc' },
    include: { translations: withTranslation(locale) }
  });

  return productsData;
}

export async function updateProductTranslationDescAction(productId: string, locale: string, description: string) {
  await prisma.productTranslation.updateMany({
    where: { product_id: productId, locale },
    data: { description }
  });
  return { success: true };
}

export async function getReportsData(locale: string = "az") {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  const company = await prisma.company.findFirst({
    where: { owner_id: user.id },
    select: { id: true }
  });
  if (!company) return null;

  const productsData = await prisma.product.findMany({
    where: { company_id: company.id },
    orderBy: { views: 'desc' },
    include: {
      translations: { ...withTranslation(locale), select: { id: true, product_id: true, name: true, locale: true } },
      _count: {
        select: { forumPosts: true }
      }
    }
  });

  const productsWithStats = productsData.map((p: any) => ({
    ...p,
    forum_posts: [{ count: p._count.forumPosts }]
  }));

  return productsWithStats;
}


export async function resubmitCompanyAction(companyId: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  const company = await prisma.company.findFirst({
    where: { id: companyId, owner_id: user.id }
  });
  if (!company) throw new Error("Company not found or unauthorized");

  if (company.status !== "needs_changes") {
    throw new Error("Bu profil hazırda yenidən göndərilə bilməz");
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      status: "pending_review",
      submitted_at: new Date(),
      review_notes: null
    }
  });

  return { success: true };
}
