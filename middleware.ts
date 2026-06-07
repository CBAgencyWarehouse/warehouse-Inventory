import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const roleAccessMap: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  CB: "/dashboard/team",
  CLIENT: "/dashboard/client",
};

// 🎯 1. APNI NAYI APIs KO YAHAN ADD KARTE JAYEIN
// Is map mein aap batate hain ki kis API route ke liye kaunsa role allowed hai
const apiAccessMap: Record<string, string[]> = {
  "/api/inventory": ["ADMIN", "CB"],         // Inventory ki saari APIs
  "/api/users": ["ADMIN"],                  // Users management sirf Admin ke liye
  "/api/orders": ["ADMIN", "CB", "CLIENT"], // Orders sab dekh sakte hain
  "/api/analytics": ["ADMIN"],               // Analytics sirf Admin ke liye
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // ==========================================
  // 🔐 UNIFIED API ROUTES SECURITY (CORS + MULTI-API AUTH)
  // ==========================================
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL; 

    // 🛑 CORS Protection
    if (origin && origin !== allowedOrigin) {
      return NextResponse.json({ success: false, message: "CORS Error: Access Denied" }, { status: 403 });
    }

    // 🛑 Dynamic API Protection Check
    // Hum check kar rahe hain kya jo API hit hui hai wo hamari protected list (apiAccessMap) mein hai?
    const protectedRoute = Object.keys(apiAccessMap).find(route => pathname.startsWith(route));

    if (protectedRoute) {
      if (!token) {
        return NextResponse.json({ success: false, message: "Unauthorized: Token missing" }, { status: 401 });
      }

      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;
        const allowedRoles = apiAccessMap[protectedRoute];

        // Agar user ka role us API ke liye allowed nahi hai toh block kar do
        if (!allowedRoles.includes(role)) {
          return NextResponse.json(
            { success: false, message: `Forbidden: Insufficient permissions for role ${role}` },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json({ success: false, message: "Unauthorized: Invalid token" }, { status: 401 });
      }
    }

    return NextResponse.next(); 
  }

  // ==========================================
  // FRONTEND PAGES PROTECTION (DASHBOARD, AUTH, ETC.)
  // ==========================================
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup");
  const isVerifyRoute = pathname.startsWith("/verify-otp");

  if (isDashboardRoute) {
    if (!token) return NextResponse.redirect(new URL("/auth/login", request.url));
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;
      const allowedRoute = roleAccessMap[role];
      if (!allowedRoute || !pathname.startsWith(allowedRoute)) {
        return NextResponse.redirect(new URL(allowedRoute || "/auth/login", request.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  if (isVerifyRoute && token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL(roleAccessMap[payload.role as string] || "/dashboard/client", request.url));
    } catch { return NextResponse.next(); }
  }

  if (token && isAuthRoute) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL(roleAccessMap[payload.role as string], request.url));
    } catch { return NextResponse.next(); }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/login",
    "/auth/signup",
    "/verify-otp",
    "/api/:path*", // Taaki saari APIs is middleware se guzrein
  ],
};