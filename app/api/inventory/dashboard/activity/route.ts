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

  return payload as {
    id: string;
    role: "CLIENT" | "CB" | "ADMIN";
  };
}

export async function GET(req: Request) {
  try {
    const user = await getUser(req);

    // -----------------------------
    // INVENTORY MOVEMENTS FILTER
    // -----------------------------
    const movementWhere: any = {
      inventory: {
        createdById: user.id,
      },
    };

    // ADMIN sees everything
    if (user.role === "ADMIN") {
      delete movementWhere.inventory;
    }

    const logs = await prisma.inventoryMovement.findMany({
      where: movementWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        inventory: {
          select: {
            sku: true,
            bin: true,
          },
        },
      },
    });

    // -----------------------------
    // ORDERS FILTER FIX
    // -----------------------------
    const orderWhere: any = {
      items: {
        some: {
          inventory: {
            createdById: user.id,
          },
        },
      },
    };

    if (user.role === "ADMIN") {
      delete orderWhere.items;
    }

    const orders = await prisma.order.findMany({
      where: orderWhere,
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        items: {
          include: {
            inventory: {
              select: {
                sku: true,
                bin: true,
              },
            },
          },
        },
      },
    });

    // -----------------------------
    // FORMAT MOVEMENTS
    // -----------------------------
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      type: "MOVEMENT",
      text: `${log.type} - ${log.inventory?.sku ?? "Item"}`,
      subText: `SKU: ${log.inventory?.sku ?? "-"} | Bin: ${log.inventory?.bin ?? "-"}`,
      date: log.createdAt,
    }));

    // -----------------------------
    // FORMAT ORDERS
    // -----------------------------
    const formattedOrders = orders.map((order) => {
      const skus =
        order.items.map((i) => i.inventory?.sku).filter(Boolean).join(", ") ||
        "-";

      const bins =
        order.items.map((i) => i.inventory?.bin).filter(Boolean).join(", ") ||
        "-";

      return {
        id: order.id,
        type: "ORDER",
        status: order.status,
        text: `Shipment #${order.orderNumber} ${order.status.toLowerCase()}`,
        subText: `SKU: ${skus} | Bin: ${bins}`,
        date: order.updatedAt,
      };
    });

    // -----------------------------
    // COMBINE + SORT
    // -----------------------------
    const combinedActivities = [...formattedLogs, ...formattedOrders]
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: combinedActivities,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}