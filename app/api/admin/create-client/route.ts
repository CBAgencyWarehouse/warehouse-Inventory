import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import nodemailer from "nodemailer";
import { jwtVerify } from "jose";
import { uploadToCloudinary } from "@/lib/cloudinary";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// 🔐 Token extraction
async function getUserFromToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cookieHeader = req.headers.get("cookie");

  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && cookieHeader) {
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    token = match ? match[1] : null;
  }

  if (!token) throw new Error("Unauthorized");

  const { payload } = await jwtVerify(token, secret);
  return payload as { id: string; role: string; email: string };
}

// 🔐 Admin check
async function requireAdmin(req: Request) {
  const user = await getUserFromToken(req);
  if (user.role !== "ADMIN") throw new Error("Forbidden: Admin only");
  return user;
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);

    const formData = await req.formData();

    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const companyName = formData.get("companyName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const notes = formData.get("notes") as string;
    const role = formData.get("role") as string;
    const imageFile = formData.get("image") as File;

    // validation
    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and Email required" },
        { status: 400 }
      );
    }

    // check user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // check invitation
    const existingInvitation = await prisma.invitation.findUnique({
      where: { email },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already sent" },
        { status: 400 }
      );
    }

    // 🔥 SAFE ROLE MAP (NO PRISMA ENUM ISSUE)
    const safeRole =
      role === "CB" ? "CB" : "CLIENT";

    // ☁️ Cloudinary upload
    let imageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadToCloudinary(imageFile, "profile");
    }

    // token generate
    const token = uuid();

    // save invitation
    await prisma.invitation.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        role: safeRole,
        name,
        companyName,
        phone,
        address,
        notes,
        image: imageUrl,
      },
    });

    // invite link
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register/${token}`;

    // email sender
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
        <div>
          <h2>Welcome ${name}</h2>
          <p>Click below to complete your registration:</p>
          <a href="${link}">Complete Registration</a>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
    });

  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}