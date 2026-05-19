'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Breadcrumb, EmptyState } from '@/components/ui-kit'
import { ProductCard } from '@/components/cards'

export default function AllProductsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all')

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      let query = supabase
        .from('products')
        .select('*, translations:product_translations(*), company:companies(slug, logo_url, translations:company_translations(name))')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50)

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter)
      }

      const { data } = await query
      setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [typeFilter])

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        <div className="space-y-4">
          <Breadcrumb
            items={[
              { label: 'Ensiklopediya', href: '/encyclopedia' },
              { label: 'Məhsullar' },
            ]}
          />
          <h1 className="text-4xl font-black tracking-tight flex items-baseline gap-3">
            Bütün Məhsullar
            <span className="text-muted-foreground font-medium text-xl">({products.length})</span>
          </h1>
        </div>

        {/* Filter */}
        <div className="flex gap-3">
          {[
            { value: 'all', label: 'Hamısı' },
            { value: 'product', label: 'Məhsullar' },
            { value: 'service', label: 'Xidmətlər' },
          ].map((f) => {
            const isActive = typeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value as any)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all border"
                style={
                  isActive
                    ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)', borderColor: 'var(--accent)' }
                    : { borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }
                }
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface h-72 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Heç bir məhsul tapılmadı"
            description="Seçilmiş kateqoriyada hələlik məhsul yoxdur."
          />
        )}
      </div>
    </div>
  )
}
