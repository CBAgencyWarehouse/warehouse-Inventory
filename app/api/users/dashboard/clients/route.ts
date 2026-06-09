import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// ─── AUTH FROM COOKIE ─────────────────────
async function getUser(req: Request) {
  const cookieHeader = req.headers.get("cookie");

  if (!cookieHeader) {
    throw new Error("Unauthorized: No cookies found");
  }

  const match = cookieHeader.match(/auth_token=([^;]+)/);
  const token = match?.[1];

  if (!token) {
    throw new Error("Unauthorized: auth_token missing");
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    if (!payload?.id) {
      throw new Error("Invalid token payload");
    }

    return payload;
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err);
    throw new Error("Unauthorized: Invalid or expired token");
  }
}

// ─── GET CLIENTS ──────────────────────────
export async function GET(req: Request) {
  try {
    await getUser(req);

    const clients = await prisma.user.findMany({
      where: {
        role: {
          in: ["CLIENT", "CB"],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        role: true,
        createdAt: true,
        isActivated: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: clients,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    );
  }
}