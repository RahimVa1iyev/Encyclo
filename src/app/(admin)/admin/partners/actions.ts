"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

async function verifySuperadmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "superadmin") {
    throw new Error("Unauthorized")
  }
  return user
}

export async function addPartnerSite(name: string, domain: string, category_id?: string) {
  const supabase = await createServerSupabaseClient()
  await verifySuperadmin(supabase)

  const apiKey = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '').substring(0, 16);

  const { error } = await supabase
    .from("partner_sites")
    .insert({
      name,
      domain,
      api_key: apiKey,
      status: 'active',
      category_id: category_id || null
    })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/partners')
}

export async function addCompanyToSite(partner_site_id: string, company_id: string, priority: number = 0) {
  const supabase = await createServerSupabaseClient()
  await verifySuperadmin(supabase)

  const { error } = await supabase
    .from("partner_site_companies")
    .insert({
      partner_site_id,
      company_id,
      priority
    })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/partners')
}

export async function removeCompanyFromSite(partner_site_id: string, company_id: string) {
  const supabase = await createServerSupabaseClient()
  await verifySuperadmin(supabase)

  const { error } = await supabase
    .from("partner_site_companies")
    .delete()
    .eq("partner_site_id", partner_site_id)
    .eq("company_id", company_id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/partners')
}

export async function updatePartnerSiteStatus(id: string, status: 'active' | 'suspended') {
  const supabase = await createServerSupabaseClient()
  await verifySuperadmin(supabase)

  const { error } = await supabase
    .from("partner_sites")
    .update({ status })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/partners')
}
