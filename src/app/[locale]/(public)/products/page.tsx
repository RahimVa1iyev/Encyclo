import { prisma } from '@/lib/db'
import { getPaginationParams, getTotalPages } from '@/lib/pagination'
import Pagination from '@/components/Pagination'
import { Breadcrumb, EmptyState } from '@/components/ui-kit'
import { ProductCard } from '@/components/cards'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Məhsullar — Encyclo',
  description: 'Azərbaycan şirkətlərinin məhsul və xidmətlərini kəşf edin.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/products`,
  },
}

import { withTranslation, getTranslation } from '@/lib/prisma-locale';

export default async function AllProductsPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { locale } = await params;
  const search = await searchParams
  const { page, perPage, from, to } = getPaginationParams(search)
  const typeFilter = (search.type as string) || 'all'

  const whereClause: any = { status: 'active' }
  if (typeFilter === 'product') whereClause.type = 'product'
  if (typeFilter === 'service') whereClause.type = 'service'

  const [count, products] = await Promise.all([
    prisma.product.count({ where: whereClause }),
    prisma.product.findMany({
      where: whereClause,
      include: {
        translations: withTranslation(locale),
        company: {
          include: {
            translations: withTranslation(locale),
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip: from,
      take: to - from + 1,
    })
  ])
  const totalPages = getTotalPages(count || 0, perPage)

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
            <span className="text-muted-foreground font-medium text-xl">({count || 0})</span>
          </h1>
        </div>

        {/* Type filter */}
        <div className="flex gap-3">
          {[
            { value: 'all', label: 'Hamısı' },
            { value: 'product', label: 'Məhsullar' },
            { value: 'service', label: 'Xidmətlər' },
          ].map((f) => {
            const isActive = typeFilter === f.value;
            return (
              <a
                key={f.value}
                href={`/products?type=${f.value}&page=1`}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all border"
                style={
                  isActive
                    ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)', borderColor: 'var(--accent)' }
                    : { borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }
                }
              >
                {f.label}
              </a>
            )
          })}
        </div>

        {products && products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} basePath={`/products?type=${typeFilter}`} />
          </>
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
