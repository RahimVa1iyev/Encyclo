"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    totalViews: 0,
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

      if (!company) {
        setIsLoading(false);
        return;
      }

      // Fetch product counts
      const { data: allProducts } = await supabase
        .from('products')
        .select('id, status, created_at, slug, images, translations:product_translations(*)')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (allProducts) {
        setStats({
          totalProducts: allProducts.length,
          activeProducts: allProducts.filter(p => p.status === 'active').length,
          draftProducts: allProducts.filter(p => p.status === 'draft').length,
          totalViews: 0, // will add later
        });
        setRecentProducts(allProducts.slice(0, 5));
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Xoş gəldiniz! Bugünkü vəziyyət.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Ümumi Məhsullar", value: stats.totalProducts },
          { label: "Aktiv Məhsullar", value: stats.activeProducts },
          { label: "Qaralamalar", value: stats.draftProducts },
          { label: "Baxışlar", value: "Tezliklə" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <div className="mt-2">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Son məhsullar</h2>
        {recentProducts.length === 0 ? (
          <p className="text-gray-400 text-sm">Hələ məhsul əlavə etməmisiniz.</p>
        ) : (
          <div className="space-y-3">
            {recentProducts.map((product) => {
              const name = product.translations?.[0]?.name || product.slug;
              return (
                <div key={product.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border overflow-hidden flex-shrink-0">
                    {product.images?.[0] 
                      ? <img src={product.images[0]} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📦</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-400">{product.status === 'active' ? 'Aktiv' : product.status === 'draft' ? 'Qaralama' : 'Dayandırılıb'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
