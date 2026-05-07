"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Package, 
  MessageSquare, 
  TrendingUp,
  ExternalLink,
  Loader2,
  BarChart3
} from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalForumPosts: 0,
  });
  const [products, setProducts] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) { setIsLoading(false); return; }

      // Fetch products with views and forum post counts
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          id, slug, status, views, type, created_at,
          translations:product_translations(name, locale),
          forum_posts(count)
        `)
        .eq('company_id', company.id)
        .order('views', { ascending: false });

      if (productsData) {
        setProducts(productsData);
        setStats({
          totalViews: productsData.reduce((sum, p) => sum + (p.views || 0), 0),
          totalProducts: productsData.length,
          activeProducts: productsData.filter(p => p.status === 'active').length,
          totalForumPosts: productsData.reduce((sum, p) => sum + (p.forum_posts?.[0]?.count || 0), 0),
        });
      }

      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hesabatlar</h1>
        <p className="text-muted-foreground mt-1">Məhsullarınızın performansı</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Ümumi Baxış", 
            value: stats.totalViews.toLocaleString(), 
            icon: Eye, 
            color: "text-blue-600",
            bg: "bg-blue-50"
          },
          { 
            label: "Aktiv Məhsullar", 
            value: `${stats.activeProducts}/${stats.totalProducts}`, 
            icon: Package, 
            color: "text-green-600",
            bg: "bg-green-50"
          },
          { 
            label: "Forum Şərhlər", 
            value: stats.totalForumPosts.toLocaleString(), 
            icon: MessageSquare, 
            color: "text-purple-600",
            bg: "bg-purple-50"
          },
          { 
            label: "Ort. Baxış/Məhsul", 
            value: stats.totalProducts > 0 
              ? Math.round(stats.totalViews / stats.totalProducts).toLocaleString() 
              : "0", 
            icon: TrendingUp, 
            color: "text-orange-600",
            bg: "bg-orange-50"
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="rounded-2xl border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-9 w-9 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Products Performance Table */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle className="text-base font-bold">Məhsul Performansı</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">Hələ məhsul əlavə etməmisiniz</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Məhsul</th>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> Baxış
                      </div>
                    </th>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" /> Şərh
                      </div>
                    </th>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => {
                    const name = product.translations?.find((t: any) => t.locale === 'az')?.name 
                      || product.translations?.[0]?.name 
                      || product.slug;
                    const forumCount = product.forum_posts?.[0]?.count || 0;
                    const viewsPercent = stats.totalViews > 0 
                      ? Math.round(((product.views || 0) / stats.totalViews) * 100) 
                      : 0;

                    return (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pr-4">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {product.type === 'service' ? 'Xidmət' : 'Məhsul'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <Badge className={
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-700 border-none' 
                              : product.status === 'draft'
                              ? 'bg-gray-100 text-gray-600 border-none'
                              : 'bg-red-100 text-red-600 border-none'
                          }>
                            {product.status === 'active' ? 'Aktiv' : product.status === 'draft' ? 'Qaralama' : 'Dayandırılıb'}
                          </Badge>
                        </td>
                        <td className="py-4 text-center">
                          <div className="space-y-1">
                            <p className="font-bold text-gray-900">{(product.views || 0).toLocaleString()}</p>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mx-auto max-w-[80px]">
                              <div 
                                className="bg-indigo-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${viewsPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <p className="font-bold text-gray-900">{forumCount}</p>
                        </td>
                        <td className="py-4 text-right">
                          <Link
                            href={`/encyclopedia/products/${product.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-bold"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
