import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/contact"];

// Define routes that should redirect authenticated users away
const authRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes to pass through
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check if user has a session token (better-auth stores it in cookies)
  const sessionToken = request.cookies.get("better-auth.session_token");

  // If accessing an auth route (login/register) and has session
  if (authRoutes.includes(pathname) && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // For change-password, allow if has session (client-side will handle status check)
  if (pathname === "/change-password") {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // For all other protected routes, require session token
  if (!sessionToken) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
