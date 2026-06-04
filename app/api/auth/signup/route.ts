// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password, name, companyName } = await request.json();

    // بنیادی ویلیڈیشن
    if (!email || !password) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    // 1. چیک کریں کہ کیا یہ ای میل پہلے سے سسٹم میں رجسٹرڈ ہے؟
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ 
        error: "This email is already registered. Please sign in instead." 
      }, { status: 400 });
    }

    // 2. سیکیور پاسورڈ ہیشنگ
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. ہر طرح کے نئے یوزر کو ڈیٹا بیس میں کریٹ (Create) کرنا
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(), // ای میل کو کلین اور لوئرکیس کر کے سیو کریں
        password: hashedPassword,
        name: name || null,
        companyName: companyName || null,
        isActivated: true // اوپن رجسٹریشن ہے تو اکاؤنٹ بائی ڈیفالٹ ایکٹیو ہوگا
      }
    });

    return NextResponse.json({ 
      message: "Registration successful!",
      user: { id: newUser.id, email: newUser.email } 
    }, { status: 201 }); // 201 کا مطلب ہے Resource Created

  } catch (error) {
    console.error("SIGNUP_ROUTE_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}