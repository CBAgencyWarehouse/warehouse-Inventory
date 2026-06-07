import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // ❌ Admin block (optional for OTP flow)
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Admin must use admin login." },
        { status: 403 }
      );
    }

    if (user.role === "CB") {
      return NextResponse.json(
        { error: "CB Team must use CB warehouse login." },
        { status: 403 }
      );
    }

    if (!user.isActivated) {
      return NextResponse.json(
        { error: "Account not activated." },
        { status: 403 }
      );
    }

    // ==============================
    // 🔐 OTP GENERATION
    // ==============================
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await prisma.user.update({
      where: { email: user.email },
      data: {
        otp,
        otpExpiry,
      },
    });

    // ==============================
    // 📩 EMAIL SEND
    // ==============================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Your Login OTP Code",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Login Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing:4px;color:#2563eb">${otp}</h1>
          <p>This code will expire in <b>5 minutes</b>.</p>
        </div>
      `,
    });

    // ==============================
    // RESPONSE (NO JWT YET)
    // ==============================
    return NextResponse.json({
      message: "OTP sent to your email",
      email: user.email,
    });
  } catch (error) {
    console.error("LOGIN_ROUTE_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}