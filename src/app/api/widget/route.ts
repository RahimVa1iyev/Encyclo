import { withTranslation } from "@/lib/prisma-locale";
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { PLAN_LIMITS } from '@/lib/constants/plans'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  let limit = Math.min(parseInt(searchParams.get('limit') || '5') || 5, 20)
  const type = searchParams.get('type') // 'companies' | 'products'
  const locale = searchParams.get('locale') || 'az';
  const companyId = searchParams.get('company_id') || searchParams.get('company')

  // 1. Domain whitelist check
  const referer = request.headers.get('referer') || request.headers.get('origin')
  let activeCompanyId = companyId

  if (referer) {
    try {
      const url = new URL(referer)
      const parts = url.hostname.split('.')
      const rootDomain = parts.length >= 2 ? parts.slice(-2).join('.') : url.hostname

      const deployments = await prisma.widgetDeployment.findMany({
        where: {
          domain: rootDomain,
          status: 'active',
          ...(activeCompanyId && { company_id: activeCompanyId })
        },
        select: { company_id: true },
        take: 1
      })

      if (!deployments || deployments.length === 0) {
        return NextResponse.json(
          { error: 'domain_not_authorized' },
          { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } }
        )
      }

      // Automatically use the authorized company_id if none was provided
      activeCompanyId = deployments[0].company_id
    } catch (e) {
      // Ignored malformed URL
    }
  }

  // 2. Plan-based product limit
  let planLimit = 5
  let isScale = false

  if (activeCompanyId) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        company_id: activeCompanyId,
        status: 'active'
      },
      select: { plan: true }
    })

    const planType = (subscription?.plan || 'starter') as keyof typeof PLAN_LIMITS
    planLimit = PLAN_LIMITS[planType]?.products || 5
    if (planType === 'scale') {
      isScale = true
    }
  }

  // Use the smaller of the requested limit and the plan limit, unless it's scale
  limit = isScale ? limit : Math.min(limit, planLimit)

  if (type === 'products') {
    try {
      const data = await prisma.product.findMany({
        where: {
          status: 'active',
          translations: { some: { locale: 'az' } },
          ...(activeCompanyId && { company_id: activeCompanyId })
        },
        select: {
          id: true, slug: true, images: true, type: true, status: true,
          translations: { ...withTranslation(locale), select: { name: true, description: true, features: true, locale: true } },
          company: {
            select: {
              slug: true, logo_url: true,
              translations: { ...withTranslation(locale), select: { name: true } }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        ...( !isScale && { take: limit } )
      })
      
      return NextResponse.json({ data, type: 'products' }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, s-maxage=60',
        }
      })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Default: companies
  try {
    let categoryId = undefined;
    if (category) {
      const cat = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true }
      })
      if (cat) categoryId = cat.id;
    }

    const data = await prisma.company.findMany({
      where: {
        status: 'active',
        ...(categoryId && { category_id: categoryId })
      },
      select: {
        id: true, slug: true, logo_url: true, website: true,
        translations: { ...withTranslation(locale), select: { name: true, description: true, locale: true } },
        category: { select: { name: true, slug: true } }
      },
      orderBy: { created_at: 'desc' },
      take: limit
    })

    return NextResponse.json({ data, type: 'companies' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60',
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
