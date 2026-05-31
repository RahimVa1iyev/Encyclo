"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addKeyword(category_id: string, keyword: string, weight: number) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "superadmin") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("category_keywords")
    .insert({
      category_id,
      keyword,
      weight
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/keywords')
}

export async function removeKeyword(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "superadmin") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("category_keywords")
    .delete()
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/keywords')
}

export async function addCategory(name: string, slug: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "superadmin") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("categories")
    .insert({
      name,
      slug
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/keywords')
}

export async function generateKeywordsAI(categoryName: string, existingKeywords: string[]) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "superadmin") {
    throw new Error("Unauthorized")
  }

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: 'You are a keyword generator for an Azerbaijani business encyclopedia. Generate relevant Azerbaijani keywords for product/service category matching. Return ONLY a JSON array of objects like: [{"keyword":"bank","weight":2},{"keyword":"kredit","weight":3}] Weight 1=general, 2=relevant, 3=exact match. No explanation. No markdown. Pure JSON only.'
        },
        {
          role: 'user', 
          content: `Category: "${categoryName}"\nAlready existing keywords: ${existingKeywords.join(', ')}\nGenerate 8-10 NEW keywords not in the existing list.\nReturn JSON array only.`
        }
      ]
    })
  })

  try {
    const groqData = await groqRes.json()
    const content = groqData.choices?.[0]?.message?.content?.trim() || ''
    
    // Attempt to parse JSON safely
    const jsonStr = content.replace(/^```json/i, '').replace(/```$/i, '').trim()
    const parsed = JSON.parse(jsonStr)
    return parsed as { keyword: string, weight: number }[]
  } catch (e) {
    throw new Error('AI cavab vermədi')
  }
}
