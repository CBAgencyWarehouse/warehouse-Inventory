import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // ✅ validation
    if (!email || email.trim() === "") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // security: always same response
    if (!user) {
      return NextResponse.json({ message: "If user exists, email sent" });
    }

    // token generate
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // store token in DB (using your otp fields)
    await prisma.user.update({
      where: { email: user.email },
      data: {
        otp: token,
        otpExpiry: expiry,
      },
    });

    // mail setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:3000/reset-password?token=${token}&email=${user.email}`;

    await transporter.sendMail({
      to: user.email,
      subject: "Reset Password",
      html: `
        <div style="font-family:Arial">
          <h2>Password Reset Request</h2>
          <p>Click below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link expires in 15 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Reset email sent" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}