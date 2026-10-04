import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js middleware — Better-Auth redirect logic per §5.
 *
 * Protects photographer routes (/dashboard/*) by checking for
 * the Better-Auth session cookie. If no session cookie exists,
 * redirect to /sign-in.
 *
 * Public routes (/, /e/*, /sign-in, /sign-up, /account) are
 * accessible without authentication.
 *
 * Note: This is a lightweight cookie-presence check, NOT a full
 * session validation. The actual auth verification happens
 * server-side when the frontend calls the backend API.
 */

const PROTECTED_PATHS = ["/dashboard", "/account"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Check for Better-Auth session cookie with non-empty value
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  const isAuthenticated = !!(sessionCookie?.value && sessionCookie.value.trim().length > 0);

  // Redirect unauthenticated users away from protected pages (/dashboard, /account)
  if (
    !isAuthenticated &&
    PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    const signInUrl = new URL("/sign-in", request.url);
    const fullPath = pathname + search;
    signInUrl.searchParams.set("callbackUrl", fullPath);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  // Run proxy middleware on protected paths only
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/account",
    "/account/:path*",
  ],
};
