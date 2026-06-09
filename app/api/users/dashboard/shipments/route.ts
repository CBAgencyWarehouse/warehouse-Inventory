import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUser(req: Request) {
  const token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.headers.get("cookie")?.match(/auth_token=([^;]+)/)?.[1];

  if (!token) throw new Error("Unauthorized");

  const { payload } = await jwtVerify(token, secret);

  return payload as { id: string; role: "CLIENT" | "CB" | "ADMIN" };
}

export async function GET(req: Request) {
  try {
    const user = await getUser(req);

    // 🔥 ROLE BASED FILTER
    const where =
      user.role === "CLIENT"
        ? { clientId: user.id }
        : {}; // CB + ADMIN see all

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },

      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },

        items: {
          include: {
            inventory: {
              select: {
                id: true,
                name: true,
                sku: true,
                bin: true,
                quantity: true,
                condition: true,
                stockStatus: true,
                images: true,
              },
            },
          },
        },

        returns: {
          select: {
            id: true,
            status: true,
            receivedAt: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error" },
      { status: 500 }
    );
  }
}