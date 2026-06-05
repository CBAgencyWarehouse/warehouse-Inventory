import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, name, password, companyName } = await req.json();

  const invite = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invite) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 400 }
    );
  }

  // 🔥 STEP 1: check already user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "User already registered" },
      { status: 400 }
    );
  }

  // 🔥 STEP 2: create user
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
  data: {
    email: invite.email,
    name,
    companyName, // 🔥 ADD THIS
    password: hashed,
    role: "CLIENT",
    isActivated: true,
  },
});

  // 🔥 STEP 3: delete invitation
  await prisma.invitation.delete({
    where: { id: invite.id },
  });

  return NextResponse.json({ success: true });
}