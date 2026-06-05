import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()
  const locale = searchParams.get('locale') || 'az';

  if (!query || query.length < 2) {
    return NextResponse.json({ companies: [], products: [] })
  }

  const [companies, products] = await Promise.all([
    prisma.companyTranslation.findMany({
      where: {
        locale: locale,
        name: { contains: query, mode: 'insensitive' },
        company: { status: 'active' }
      },
      select: {
        name: true,
        company_id: true,
        company: { select: { slug: true, logo_url: true, status: true } }
      },
      take: 5
    }),
    prisma.productTranslation.findMany({
      where: {
        locale: locale,
        name: { contains: query, mode: 'insensitive' },
        product: { status: 'active' }
      },
      select: {
        name: true,
        product_id: true,
        product: {
          select: {
            slug: true,
            status: true,
            images: true,
            company: {
              select: {
                slug: true,
                logo_url: true,
                translations: { select: { name: true } }
              }
            }
          }
        }
      },
      take: 5
    })
  ])

  return NextResponse.json({
    companies,
    products,
  })
}
