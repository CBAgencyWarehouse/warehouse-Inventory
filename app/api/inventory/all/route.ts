import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUser(req: Request) {
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

  if (!token) throw new Error("No token found");

  const { payload } = await jwtVerify(token, secret);

  return payload as {
    id: string;
    role: string;
    email: string;
  };
}

export async function GET(req: Request) {
  try {
    const user = await getUser(req);

    // 1️⃣ Role Check: Only allowed roles can fetch
    if (!["CLIENT", "CB", "ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    // 2️⃣ Fetch All Items: Sub roles ko master stock pool dikhega
    const inventory = await prisma.inventory.findMany({
      orderBy: {
        createdAt: "desc", // Latest items on top
      },
    });

    return NextResponse.json({
      success: true,
      count: inventory.length,
      data: inventory,
    }, { status: 200 });

  } catch (err: any) {
    console.error("❌ INVENTORY GET ERROR:", err.message);

    // 3️⃣ Auth Failures Handle (Token missing or expired)
    if (err.message === "No token found" || err.code === "ERR_JWT_EXPIRED" || err.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}