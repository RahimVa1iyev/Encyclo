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
  const isAdmin = request.nextUrl.pathname.startsWith('/admin')

  // Not logged in — protect dashboard, onboarding, and admin
  if (!user && (isDashboard || isOnboarding || isAdmin)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'company'


  // Read role once and store in header to minimize DB calls in downstream Server Components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-role', role)

  const finalResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Preserve any cookies set by supabase.auth.getUser()
  response.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value)
  })
  
  response = finalResponse

  if (role === 'superadmin') {
    // Superadmin strict routing: keep them in /admin
    if (isDashboard || isOnboarding || isLogin || isRegister) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return response
  } else {
    // Company routing
    if (isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isDashboard) {
      const onboardingCompleted = user.user_metadata?.onboarding_completed
      if (!onboardingCompleted) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }

    if (isLogin || isRegister) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
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
