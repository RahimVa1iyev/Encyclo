"use server"

import { requireSuperadmin } from "@/lib/admin-auth";

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addKeyword(category_id: string, keyword: string, weight: number) {
  const user = await requireSuperadmin();

  await prisma.categoryKeyword.create({
    data: {
      category_id,
      keyword,
      weight
    }
  })

  revalidatePath('/admin/keywords')
}

export async function removeKeyword(id: string) {
  const user = await requireSuperadmin();

  await prisma.categoryKeyword.delete({
    where: { id }
  })

  revalidatePath('/admin/keywords')
}

export async function addCategory(name: string, slug: string) {
  const user = await requireSuperadmin();

  await prisma.category.create({
    data: {
      name,
      slug
    }
  })

  revalidatePath('/admin/keywords')
}

export async function generateKeywordsAI(categoryName: string, existingKeywords: string[]) {
  const user = await requireSuperadmin();

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

export async function deleteCategory(id: string) {
  const user = await requireSuperadmin();
  // Check if category has companies or products
  const inUse = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          companies: true,
          products: true,
        }
      }
    }
  })

  if (!inUse) throw new Error("Kateqoriya tapılmadı")

  if (inUse._count.companies > 0 || inUse._count.products > 0) {
    throw new Error(
      `Bu kateqoriya silinə bilməz — ${inUse._count.companies} şirkət və ${inUse._count.products} məhsul bağlıdır`
    )
  }

  // Delete translations and keywords first (cascade may handle it, but explicit is safer)
  await prisma.categoryTranslation.deleteMany({ where: { category_id: id } })
  await prisma.categoryKeyword.deleteMany({ where: { category_id: id } })
  await prisma.category.delete({ where: { id } })

  revalidatePath('/admin/keywords')
  return { success: true }
}
