import { createServerSupabaseClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, User, ExternalLink } from "lucide-react";
import NewPostForm from "@/components/forum/NewPostForm";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ProductForumPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get product
  const { data: product } = await supabase
    .from("products")
    .select(`
      *, 
      translations:product_translations(*), 
      company:companies(
        slug, 
        logo_url, 
        translations:company_translations(*)
      )
    `)
    .eq("slug", params.slug)
    .single();

  if (!product) notFound();

  // Get forum posts for this product
  const { data: posts } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  const productTranslation = product.translations?.find((t: any) => t.locale === 'az') || product.translations?.[0];
  const companyTranslation = product.company?.translations?.find((t: any) => t.locale === 'az') || product.company?.translations?.[0];

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link href="/forum" className="text-slate-400 hover:text-indigo-600 transition-colors">Forum</Link>
          <span className="text-slate-300">/</span>
          <Link href={`/encyclopedia/companies/${product.company?.slug}`} className="text-slate-400 hover:text-indigo-600 transition-colors">
            {companyTranslation?.name}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 truncate">{productTranslation?.name}</span>
        </nav>

        {/* Product Mini Header */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 shadow-inner">
            {product.company?.logo_url ? (
              <img src={product.company.logo_url} alt={companyTranslation?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold text-xl uppercase">
                {companyTranslation?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {productTranslation?.name} — Müzakirələr
            </h1>
            <p className="text-slate-500 font-medium">
              {companyTranslation?.name} tərəfindən təqdim edilən həll haqqında fikirlər
            </p>
          </div>
          <Link 
            href={`/encyclopedia/products/${product.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            Məhsul səhifəsi <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* New Post Form */}
        <NewPostForm productId={product.id} user={user} />

        {/* Posts List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-600" /> 
              Müzakirələr 
              <Badge variant="secondary" className="ml-2 bg-indigo-50 text-indigo-600 border-indigo-100">
                {posts?.length || 0}
              </Badge>
            </h2>
          </div>

          <div className="grid gap-6">
            {posts && posts.length > 0 ? (
              posts.map((post: any) => {
                const date = new Date(post.created_at);
                const anonymousName = `İstifadəçi ${post.user_id.slice(0, 4)}`;

                return (
                  <div key={post.id} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{anonymousName}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {format(date, "d MMMM yyyy", { locale: az })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center space-y-4 text-slate-400">
                <p>Hələ ki, heç bir şərh yoxdur. İlk şərhi siz yazın!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
