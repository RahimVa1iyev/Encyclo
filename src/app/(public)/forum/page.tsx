import { createServerSupabaseClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import Link from "next/link";
import { MessageSquare, ArrowRight, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const supabase = createServerSupabaseClient();

  const { data: posts } = await supabase
    .from("forum_posts")
    .select(`
      *,
      product:products(
        slug, 
        translations:product_translations(name, locale),
        company:companies(slug, logo_url, translations:company_translations(name))
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-slate-50/30 py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="space-y-4 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
            <MessageSquare className="w-4 h-4" /> Forum
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Məhsullar haqqında müzakirələr
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Ən son texnoloji həllər, proqram təminatları və xidmətlər barədə istifadəçi təcrübələrini oxuyun.
          </p>
        </div>

        {/* Posts List */}
        <div className="grid gap-6">
          {posts && posts.length > 0 ? (
            posts.map((post: any) => {
              const product = post.product;
              const productTranslation = product?.translations?.find((t: any) => t.locale === 'az') || product?.translations?.[0];
              const company = product?.company;
              const companyTranslation = company?.translations?.find((t: any) => t.locale === 'az') || company?.translations?.[0];
              const date = new Date(post.created_at);

              return (
                <Card key={post.id} className="rounded-3xl border-slate-100 hover:shadow-xl hover:shadow-indigo-100/30 transition-all group overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                      {/* Left: Company & Meta */}
                      <div className="md:w-48 flex-shrink-0 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 shadow-inner">
                            {company?.logo_url ? (
                              <img src={company.logo_url} alt={companyTranslation?.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold text-xs uppercase">
                                {companyTranslation?.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest truncate">
                              {companyTranslation?.name}
                            </p>
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {productTranslation?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          {format(date, "d MMMM yyyy", { locale: az })}
                        </div>
                      </div>

                      {/* Right: Content */}
                      <div className="flex-1 space-y-4">
                        <p className="text-slate-600 leading-relaxed line-clamp-3 italic">
                          "{post.content}"
                        </p>
                        <div className="flex justify-end items-center">
                          <Link 
                            href={`/encyclopedia/products/${product.slug}`}
                            className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-3 transition-all"
                          >
                            Məhsula bax <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="py-20 text-center space-y-6 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-10 h-10 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Hələ ki, heç bir müzakirə yoxdur</h3>
                <p className="text-slate-500">Müzakirəyə ilk başlayan siz olun!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
