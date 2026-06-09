import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUser(req: Request) {
  const token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.headers.get("cookie")?.match(/auth_token=([^;]+)/)?.[1];

  if (!token) throw new Error("No token found");

  const { payload } = await jwtVerify(token, secret);

  return payload as {
    id: string;
    role: "CLIENT" | "CB" | "ADMIN";
  };
}

export async function GET(req: Request) {
  try {
    const user = await getUser(req);

    const inventoryWhere: any = {
      isDeleted: false,
    };

    // -----------------------------
    // ROLE BASED INVENTORY FILTER
    // -----------------------------
    if (user.role === "CLIENT" || user.role === "CB") {
      inventoryWhere.createdById = user.id;
    }

    // -----------------------------
    // 🔥 FIXED PENDING ORDERS LOGIC
    // -----------------------------
    const pendingOrdersWhere: any = {
      status: "PENDING",
      items: {
        some: {
          inventory: {
            createdById: user.id,
          },
        },
      },
    };

    // ADMIN ko full system pending orders
    if (user.role === "ADMIN") {
      delete pendingOrdersWhere.items;
    }

    const [totalItems, pendingOrders, activeReturns, issues] =
      await Promise.all([
        prisma.inventory.count({
          where: inventoryWhere,
        }),

        prisma.order.count({
          where: pendingOrdersWhere,
        }),

        prisma.return.count({
          where: {
            clientId: user.id,
            status: { in: ["PENDING", "RECEIVED"] },
          },
        }),

        prisma.inventory.count({
          where: {
            ...inventoryWhere,
            OR: [
              { stockStatus: "OUT_OF_STOCK" },
              { stockStatus: "DISCONTINUED" },
            ],
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalItems: totalItems ?? 0,
        pendingOrders: pendingOrders ?? 0,
        activeReturns: activeReturns ?? 0,
        issues: issues ?? 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Server Error",
      },
      { status: 401 }
    );
  }
}