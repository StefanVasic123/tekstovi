/*
 * An array of routes that are accessible to the public
 * These routes do not require auth
 * @type {string[]}
 */
export const publicRoutes = ['/'];

/**
 * An array of routes that are protected
 * These routes can be accessed only if user is logged in
 * @type {string[]}
 */
export const protectedRoutes = ['/admin', '/my-account', '/settings'];

/**
 * An array of routes that are used for auth
 * These routes will redirect logged in users to /logout
 * @type {string[]}
 */
export const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/reset',
  '/auth/new-password',
  '/how-it-works',
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = '/api/auth';

export const apiLogout = ['/logout'];

export const loginRoute = ['/auth/login'];

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = '/';
