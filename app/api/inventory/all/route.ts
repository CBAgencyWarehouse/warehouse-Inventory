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

    if (!["CLIENT", "CB", "ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    let whereClause: any = { isDeleted: false };

    if (user.role === "CLIENT") {
      whereClause.clientId = user.id;
    } else if (["CB", "ADMIN"].includes(user.role)) {
      whereClause.createdById = user.id;
    }

    const inventory = await prisma.inventory.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: inventory.length,
      data: inventory,
    }, { status: 200 });

  } catch (err: any) {
    console.error("❌ INVENTORY GET ERROR:", err.message);

    if (
      err.message === "No token found" ||
      err.code === "ERR_JWT_EXPIRED" ||
      err.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}