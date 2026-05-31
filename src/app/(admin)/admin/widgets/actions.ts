"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateWidgetStatus(id: string, status: 'active' | 'blocked') {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify superadmin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "superadmin") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("widget_deployments")
    .update({ status, added_by: user.id })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/widgets')
}

export async function addWidgetDomain(company_id: string, domain: string, notes?: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify superadmin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "superadmin") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("widget_deployments")
    .insert({
      company_id,
      domain,
      status: 'active',
      notes,
      added_by: user.id
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/widgets')
}
