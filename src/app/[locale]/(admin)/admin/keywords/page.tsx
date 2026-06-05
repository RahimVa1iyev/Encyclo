import { prisma } from "@/lib/db"
import KeywordsClient from "./KeywordsClient"

export default async function KeywordsPage() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      categoryKeywords: { select: { id: true, keyword: true, weight: true } }
    },
  }).then((cats: any[]) => cats.map((c: any) => ({
    ...c,
    categoryKeywords: c.categoryKeywords.map((k: any) => ({ ...k, weight: k.weight ?? 1 }))
  })))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Category Keywords</h1>
      </div>
      <KeywordsClient categories={categories} />
    </div>
  )
}
