import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routes } from "./lib/routes";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "token",
  );

  const { pathname } = req.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = [
    routes.login,
    routes.register,
    routes.verifyRegister,
    routes.forgotPassword,
    routes.verifyForgotPassword,
  ];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If on public route and already logged in, redirect to dashboard
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If NOT on public route and NOT logged in, redirect to login
  if (!isPublicRoute && !token) {
    const loginUrl = new URL(routes.login, req.url);
    // Store the attempted URL to redirect back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
