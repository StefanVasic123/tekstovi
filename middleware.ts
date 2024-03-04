import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

// NextAuth(authConfig) return auth ... that needs to be exported as middleware
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

export const { auth } = NextAuth(authConfig);

const locales = ['en-US', 'sr_RS', 'de', 'fr', 'es'];

import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  apiLogout,
  loginRoute,
  protectedRoutes,
} from '@/routes';

const intlMiddleware = createIntlMiddleware({
  locales,
  localePrefix: 'always',
  defaultLocale: 'en-US',
});

export default async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  // Init intl middleware response
  const intlResponse = intlMiddleware(req);

  // APIs handle their own auth, but they still need locale data
  if (req.nextUrl.pathname.includes('api')) {
    return intlResponse;
  }
  // handle public routes...
  // private routes here
  const session = await auth();
  if (session !== null) {
    return intlResponse;
  } else {
    return intlResponse;
  }

  // redirect to sign in if unauthorized
  /* const nextUrl = req.nextUrl.clone();
  nextUrl.pathname = '/';
  */
  // When using redirect Next.js expects a 3xx status code otherwise it errors out
  /*
  return NextResponse.redirect(`${origin}/`, {
    ...intlResponse,
    status: 308,
  });
  */
}

// every route will invoke middleware
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
