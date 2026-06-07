import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const roleAccessMap: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  CB: "/dashboard/team",
  CLIENT: "/dashboard/client",
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signup");

  // 👉 ADD THIS
  const isVerifyRoute = pathname.startsWith("/verify-otp");

  // ===============================
  // PROTECT DASHBOARD ROUTES
  // ===============================
  if (isDashboardRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      const allowedRoute = roleAccessMap[role];

      if (!allowedRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      if (!pathname.startsWith(allowedRoute)) {
        return NextResponse.redirect(new URL(allowedRoute, request.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // ===============================
  // BLOCK VERIFY-OTP IF LOGGED IN
  // ===============================
  if (isVerifyRoute && token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      return NextResponse.redirect(
        new URL(roleAccessMap[role] || "/dashboard/client", request.url)
      );
    } catch {
      return NextResponse.next();
    }
  }

  // ===============================
  // AUTH ROUTES (login/signup)
  // ===============================
  if (token && isAuthRoute) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      return NextResponse.redirect(
        new URL(roleAccessMap[role], request.url)
      );
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/login",
    "/auth/signup",
    "/verify-otp",
  ],
};