import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUserIdFromToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cookieHeader = req.headers.get("cookie");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) token = authHeader.split(" ")[1];
  if (!token && cookieHeader) {
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    token = match ? match[1] : null;
  }
  if (!token) throw new Error("Unauthorized");

  const { payload } = await jwtVerify(token, secret);
  return payload.id as string;
}

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);

    const orders = await prisma.order.findMany({
      where: { clientId: userId },
      include: {
        items: {
          include: {
            inventory: true, // Item ka naam aur SKU nikalne ke liye
          },
        },
      },
      orderBy: { createdAt: "desc" }, // Newest orders first
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}