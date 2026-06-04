// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { SignJWT } from 'jose';

// JWT کی خفیہ کی (Secret Key) جو .env میں ہونی چاہیے
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-fallback-super-secret-key-change-this'
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // 1. یوزر کو ڈیٹا بیس میں تلاش کریں
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // 2. پاسورڈ میچ کریں
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // 3. سیکیور JWT ٹوکن تیار کریں (اس میں یوزر کی معلومات سیو کریں)
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d') // 7 دن کے لیے لاگ ان رہے گا
      .sign(JWT_SECRET);

    // 4. ٹوکن کو HttpOnly کوکی میں سیٹ کر کے رسپانس بھیجیں
    const response = NextResponse.json({ 
      message: "Login successful!",
      user: { email: user.email, role: user.role, name: user.name }
    }, { status: 200 });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true, // جاوا اسکرپٹ اس ٹوکن کو چوری نہیں کر سکتی (XSS پروٹیکشن)
      secure: process.env.NODE_ENV === 'production', // پروڈکشن پر صرف HTTPS پر چلے گا
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 دن سیشن برقرار رہے گا
    });

    return response;

  } catch (error) {
    console.error("LOGIN_ROUTE_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}