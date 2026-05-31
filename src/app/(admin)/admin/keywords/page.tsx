import { createServerSupabaseClient } from "@/lib/supabase/server"
import KeywordsClient from "./KeywordsClient"

export default async function KeywordsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, category_keywords(id, keyword, weight)')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Category Keywords</h1>
      </div>
      <KeywordsClient categories={categories || []} />
    </div>
  )
}
