// middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/request';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-fallback-super-secret-key-change-this'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. اگر یوزر لاگ ان نہیں ہے اور ڈیش بورڈ پر جانے کی کوشش کر رہا ہے
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      // ٹوکن کی تصدیق کریں
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      // اگر ٹوکن خراب یا ایکسپائر ہے تو لاگ ان پر بھیجیں
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // 2. اگر یوزر پہلے سے لاگ ان ہے اور دوبارہ لاگ ان/سائن اپ پیج کھول رہا ہے
  if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
    try {
      await jwtVerify(token, JWT_SECRET);
      // اسے براہ راست ڈیش بورڈ پر بھیج دیں
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (err) {
      // ٹوکن خراب ہو تو آگے جانے دیں (کوکی اگنور ہو جائے گی)
    }
  }

  return NextResponse.next();
}

// کن پیجز پر یہ مڈل ویئر رن ہونا چاہیے
export const config = {
  matcher: ['/dashboard/:path*', '/auth/login', '/auth/signup'],
};