import { withTranslation } from "@/lib/prisma-locale";
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import PartnersClient from "./PartnersClient"
import { redirect } from '@/lib/navigation';

export default async function PartnersPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    redirect({ href: "/login", locale: "az" });
    return;
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true }
  })

  if (profile?.role !== "superadmin") {
    redirect({ href: "/dashboard", locale: "az" });
    return;
  }

  // Fetch partner sites with their assigned companies
  const sites = await prisma.partnerSite.findMany({
    select: {
      id: true,
      name: true,
      domain: true,
      api_key: true,
      status: true,
      category_id: true,
      created_at: true,
      companies: {
        select: {
          id: true,
          company_id: true,
          priority: true,
          company: {
            select: {
              id: true,
              slug: true,
              translations: { ...withTranslation("az"), select: { name: true, locale: true } }
            }
          }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  // Fetch active companies for assignment dropdown
  const companies = await prisma.company.findMany({
    where: { status: "active" },
    select: { id: true, slug: true, translations: { ...withTranslation("az"), select: { name: true, locale: true } } }
  })

  const mappedCompanies = (companies || []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.translations?.find(
      (t: any) => t.locale === 'az'
    )?.name || c.translations?.[0]?.name || c.slug
  }))

  // Fetch categories for default category select
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return (
    <PartnersClient
      initialSites={sites || []}
      activeCompanies={mappedCompanies}
      categories={categories || []}
    />
  )
}
