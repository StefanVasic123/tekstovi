import NextAuth from 'next-auth';
import authConfig from './auth.config';

const { auth } = NextAuth(authConfig);
import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  apiLogout,
  loginRoute,
  protectedRoutes,
} from '@/routes';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isApiLogout = apiLogout.includes(nextUrl.pathname);
  const isProtected = protectedRoutes.includes(nextUrl.pathname);
  const isLoginRoute = loginRoute.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return null;
  }

  // if currently on auth route
  /**
   * problem on Vercel production
   * auth/login fetch/Redirect 302 status
   * TODO solution for auth routes when user is logged in
   * solution: conditionally render form if user is not logged in and back page if does
   */
  /*  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }
*/
  if (isProtected) {
    if (!isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }
  /*
  if (isApiLogout) {
    console.log('outside !isLoggedIn'); // nothing rendered
    if (!isLoggedIn) {
      console.log('inside !isLoggedIn'); // nothing rendered
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }
  */
  /*
  if (!isLoggedIn && !isPublicRoute) {
    if (isLoginRoute) {
      return Response.redirect(new URL('/auth/login', nextUrl));
    }
    return null;
  } */
});

// every route will invoke middleware
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
