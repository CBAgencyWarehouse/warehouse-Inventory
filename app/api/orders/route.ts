import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// --- AUTH UTILITY: Token se User Session verify karne ke liye ---
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

  if (!token) throw new Error("Unauthorized: No token found");

  const { payload } = await jwtVerify(token, secret);
  return payload as { id: string; role: string; email: string };
}

// --- 🔄 GET METHOD: Authenticated User Ke Orders Fetch Karne Ke Liye ---
export async function GET(req: Request) {
  try {
    const user = await getUser(req);

    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            inventory: {
              OR: [
                { createdById: user.id },
                { clientId: user.id },
              ],
            },
          },
        },
      },
      include: {
        client: true,
        items: {
          include: {
            inventory: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
// --- POST METHOD: Save Order & Items ---
export async function POST(req: Request) {
  try {
    // 1️⃣ Auth Guard checking
    const user = await getUser(req);

    // 2️⃣ Extract Payload from Client Form
    const body = await req.json();
    const { 
      orderNumber,
      eventName, 
      eventDate, 
      shipToAddress, 
      returnAddress, 
      specialInstructions, 
      cartItems 
    } = body;

    // 3️⃣ Basic Payload Validation
    if (!eventName || !eventDate || !shipToAddress || !returnAddress || !cartItems || Object.keys(cartItems).length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields or cart is empty." },
        { status: 400 }
      );
    }

    // 4️⃣ Execute Transaction (Nested Create)
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        eventName,
        eventDate: new Date(eventDate), 
        shipToAddress,
        returnAddress,
        specialInstructions: specialInstructions || null,
        clientId: user.id, 
        items: {
          create: Object.entries(cartItems).map(([inventoryId, qty]) => ({
            inventoryId: inventoryId,
            quantity: Number(qty),
          })),
        },
      },
      include: {
        items: true, 
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Order dynamic request created successfully.", 
        data: newOrder 
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("❌ ORDER CREATION ERROR:", err.message);

    if (err.message?.includes("Unauthorized") || err.code === "ERR_JWT_EXPIRED") {
      return NextResponse.json(
        { success: false, message: "Session expired or invalid token." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}