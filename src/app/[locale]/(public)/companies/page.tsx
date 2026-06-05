import { prisma } from '@/lib/db'
import { Breadcrumb, EmptyState } from '@/components/ui-kit'
import { CompanyCard } from '@/components/cards'
import { getPaginationParams, getTotalPages } from '@/lib/pagination'
import Pagination from '@/components/Pagination'
import { withTranslation, getTranslation } from '@/lib/prisma-locale';

export const metadata = {
  title: 'Bütün Şirkətlər — Encyclo',
  description: 'Azərbaycanın texnologiya şirkətləri',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/companies`,
  },
  openGraph: {
    title: 'Bütün Şirkətlər — Encyclo',
    description: 'Azərbaycanın texnologiya şirkətləri',
  },
}

export default async function AllCompaniesPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { locale } = await params;
  const search = await searchParams
  const { page, perPage, from, to } = getPaginationParams(search)
  const count = await prisma.company.count({ where: { status: 'active' } })

  const companies = await prisma.company.findMany({
    where: { status: 'active' },
    include: {
      translations: withTranslation(locale),
      category: true,
    },
    orderBy: { created_at: 'desc' },
    skip: from,
    take: to - from + 1,
  })

  const totalPages = getTotalPages(count || 0, perPage)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Azərbaycan Texnologiya Şirkətləri",
    "description": "Azərbaycanın texnologiya şirkətlərinin tam siyahısı.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://encyclo-phi.vercel.app'}/companies`,
    "numberOfItems": companies?.length || 0
  }

  return (
    <div className="min-h-screen py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        <div className="space-y-4">
          <Breadcrumb
            items={[
              { label: 'Ensiklopediya', href: '/encyclopedia' },
              { label: 'Şirkətlər' },
            ]}
          />
          <h1 className="text-4xl font-black tracking-tight flex items-baseline gap-3">
            Bütün Şirkətlər
            <span className="text-muted-foreground font-medium text-xl">({companies?.length || 0})</span>
          </h1>
        </div>

        {companies && companies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company: any) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} basePath="/companies" />
          </>
        ) : (
          <EmptyState
            title="Hələ heç bir şirkət yoxdur"
            description="Tezliklə yeni şirkətlər burada yayımlanacaq."
          />
        )}
      </div>
    </div>
  )
}
