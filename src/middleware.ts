import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding')
  const isLogin = request.nextUrl.pathname.startsWith('/login')
  const isRegister = request.nextUrl.pathname.startsWith('/register')

  // Not logged in — protect dashboard and onboarding
  if (!user && (isDashboard || isOnboarding)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in — check onboarding
  if (user && isDashboard) {
    const { data: company } = await supabase
      .from('companies')
      .select('onboarding_completed')
      .eq('owner_id', user.id)
      .single()

    if (company && !company.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // Logged in — redirect away from login/register
  if (user && (isLogin || isRegister)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
