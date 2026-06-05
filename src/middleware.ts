import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '../next-intl.config';

const { auth } = NextAuth(authConfig);

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 1. Skip middleware for static files and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Run intl middleware first (handles locale redirect)
  const intlResponse = intlMiddleware(req);
  
  // 3. If intl redirected (added locale prefix), return that redirect
  if (intlResponse.status !== 200 && intlResponse.headers.get('x-middleware-rewrite') === null) {
    return intlResponse;
  }

  // 4. Extract locale from pathname AFTER intl processing
  const locale = pathname.split('/')[1] || defaultLocale;

  // 5. Run existing auth/role checks
  const user = req.auth?.user;
  
  // Determine route types (now including locale prefix)
  const isDashboard = pathname.startsWith(`/${locale}/dashboard`);
  const isOnboarding = pathname.startsWith(`/${locale}/onboarding`);
  const isLogin = pathname.startsWith(`/${locale}/login`) || pathname.startsWith(`/${locale}/auth/login`);
  const isRegister = pathname.startsWith(`/${locale}/register`) || pathname.startsWith(`/${locale}/auth/register`);
  const isAdmin = pathname.startsWith(`/${locale}/admin`);

  // Not logged in — protect dashboard, onboarding, and admin
  if (!user && (isDashboard || isOnboarding || isAdmin)) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  if (user) {
    const role = (user as any).role ?? 'company';
    const onboardingCompleted = (user as any).onboarding_completed;

    console.log('[MIDDLEWARE]', {
      pathname,
      role,
      onboardingCompleted,
      isAdmin,
      isDashboard,
      isOnboarding,
      isLogin,
      isRegister,
    })

    // Set header for downstream components onto the intlResponse
    intlResponse.headers.set('x-user-role', role);

    if (role === 'superadmin') {
      if (isDashboard || isOnboarding || isLogin || isRegister || pathname === `/${locale}`) {
        return NextResponse.redirect(new URL(`/${locale}/admin`, req.url));
      }
      return intlResponse;
    } else {
      // Company routing
      if (isAdmin) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      }

      if (isDashboard) {
        if (!onboardingCompleted) {
          return NextResponse.redirect(new URL(`/${locale}/onboarding`, req.url));
        }
      }

      if (isLogin || isRegister) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      }
    }

    return intlResponse;
  }

  return intlResponse;
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ]
};
