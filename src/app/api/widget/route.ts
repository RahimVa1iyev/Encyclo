import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { PLAN_LIMITS } from '@/lib/constants/plans'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  let limit = Math.min(parseInt(searchParams.get('limit') || '5') || 5, 20)
  const type = searchParams.get('type') // 'companies' | 'products'
  const companyId = searchParams.get('company_id') || searchParams.get('company')

  const supabase = await createServerSupabaseClient()

  // 1. Domain whitelist check
  const referer = request.headers.get('referer') || request.headers.get('origin')
  let activeCompanyId = companyId

  if (referer) {
    try {
      const url = new URL(referer)
      const parts = url.hostname.split('.')
      const rootDomain = parts.length >= 2 ? parts.slice(-2).join('.') : url.hostname

      let deploymentQuery = supabase
        .from('widget_deployments')
        .select('company_id')
        .eq('domain', rootDomain)
        .eq('status', 'active')

      if (activeCompanyId) {
        deploymentQuery = deploymentQuery.eq('company_id', activeCompanyId)
      }

      const { data: deployments } = await deploymentQuery.limit(1)

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
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('company_id', activeCompanyId)
      .eq('status', 'active')
      .maybeSingle()

    const planType = (subscription?.plan || 'starter') as keyof typeof PLAN_LIMITS
    planLimit = PLAN_LIMITS[planType]?.products || 5
    if (planType === 'scale') {
      isScale = true
    }
  }

  // Use the smaller of the requested limit and the plan limit, unless it's scale
  limit = isScale ? limit : Math.min(limit, planLimit)

  if (type === 'products') {
    let query = supabase
      .from('products')
      .select(`
        id, slug, images, type, status,
        translations:product_translations(name, description, features, locale),
        company:companies(slug, logo_url, translations:company_translations(name))
      `)
      .eq('status', 'active')
      .eq('translations.locale', 'az')
      .order('created_at', { ascending: false })

    if (activeCompanyId) {
      query = query.eq('company_id', activeCompanyId)
    }

    if (!isScale) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ data, type: 'products' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60',
      }
    })
  }

  // Default: companies
  let query = supabase
    .from('companies')
    .select(`
      id, slug, logo_url, website,
      translations:company_translations(name, description, locale),
      category:categories(name, slug)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit) // limits are not applied strictly to companies according to prompt, just requested limit

  if (category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, type: 'companies' }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=60',
    }
  })
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
