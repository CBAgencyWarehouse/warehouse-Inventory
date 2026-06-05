import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email, name, companyName } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const existing = await prisma.invitation.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Invitation already sent" },
      { status: 400 }
    );
  }

  const token = uuid();

  await prisma.invitation.create({
    data: {
      email,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
  to: email,
  subject: "Complete Your Registration",
  html: `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
    
    <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#111827;padding:20px;text-align:center;">
        <h2 style="color:#ffffff;margin:0;font-size:18px;">
          Welcome to Our Platform
        </h2>
      </div>

      <!-- Body -->
      <div style="padding:25px;text-align:center;">

        <h3 style="color:#111827;margin-bottom:10px;">
          Complete Your Registration
        </h3>

        <p style="color:#6b7280;font-size:14px;line-height:1.5;">
          Your account has been created by admin.  
          Please click the button below to set your password and activate your account.
        </p>

        <!-- Button -->
        <a href="${link}" 
          style="
            display:inline-block;
            margin-top:20px;
            padding:12px 20px;
            background:#111827;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-size:14px;
            font-weight:600;
          ">
          Complete Registration
        </a>

        <p style="margin-top:25px;font-size:12px;color:#9ca3af;">
          This link will expire in 24 hours for security reasons.
        </p>

      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:12px;text-align:center;font-size:11px;color:#9ca3af;">
        © 2026 Your Company. All rights reserved.
      </div>

    </div>
  </div>
  `,
});

  return NextResponse.json({
    message: "Invitation sent",
  });
}