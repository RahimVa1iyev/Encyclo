import { createServerSupabaseClient } from "@/lib/supabase/server"
import PartnersClient from "./PartnersClient"
import { redirect } from "next/navigation"

export default async function PartnersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "superadmin") {
    redirect("/dashboard")
  }

  // Fetch partner sites with their assigned companies
  const { data: sites } = await supabase
    .from("partner_sites")
    .select(`
      id,
      name,
      domain,
      api_key,
      status,
      category_id,
      created_at,
      partner_site_companies(
        id,
        company_id,
        priority,
        companies(
          id,
          slug,
          company_translations(name, locale)
        )
      )
    `)
    .order('created_at', { ascending: false })

  // Fetch active companies for assignment dropdown
  const { data: companies } = await supabase
    .from("companies")
    .select("id, slug, company_translations(name, locale)")
    .eq("status", "active")

  const mappedCompanies = (companies || []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.company_translations?.find(
      (t: any) => t.locale === 'az'
    )?.name || c.company_translations?.[0]?.name || c.slug
  }))

  // Fetch categories for default category select
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order('name', { ascending: true })

  return (
    <PartnersClient
      initialSites={sites || []}
      activeCompanies={mappedCompanies}
      categories={categories || []}
    />
  )
}
