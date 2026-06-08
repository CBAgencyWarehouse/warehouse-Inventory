import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Make sure mapping index correctly matches your generated path
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// 🔒 Token parsing function exactly matching your authentication protocol
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

// -----------------------------------------------------------------
// 1. GET: Fetch Authenticated Client's Live Cart Rows
// -----------------------------------------------------------------
export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: {
        inventory: true, // Frontend inventory rendering logic (Images, names, sku) k liye inclusion
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: cartItems });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

// -----------------------------------------------------------------
// 2. POST: Add New Item to Cart or Increment Existing Matrix
// -----------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);
    const body = await req.json();
    const { inventoryId, quantity = 1 } = body;

    if (!inventoryId) {
      return NextResponse.json({ success: false, message: "Inventory ID is required" }, { status: 400 });
    }

    // Checking if targeted inventory item matches current warehouse bounds
    const targetInventory = await prisma.inventory.findUnique({
      where: { id: inventoryId }
    });

    if (!targetInventory) {
      return NextResponse.json({ success: false, message: "Inventory item not found" }, { status: 404 });
    }

    // ⚡ Atomic Upsert process keeping inventory composite index constraints safe
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_inventoryId: {
          userId,
          inventoryId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId,
        inventoryId,
        quantity,
      },
      include: {
        inventory: true,
      }
    });

    return NextResponse.json({ success: true, data: cartItem });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

// -----------------------------------------------------------------
// 3. PATCH: Adjust Exact Row Quantity Matrix manually (+ / - triggers)
// -----------------------------------------------------------------
export async function PATCH(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);
    const body = await req.json();
    const { cartItemId, action } = body; // action: "increment" | "decrement"

    if (!cartItemId || !action) {
      return NextResponse.json({ success: false, message: "Missing required properties" }, { status: 400 });
    }

    // Verify current element ownership
    const currentItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    });

    if (!currentItem || currentItem.userId !== userId) {
      return NextResponse.json({ success: false, message: "Cart component access denied" }, { status: 403 });
    }

    let targetQty = currentItem.quantity;
    if (action === "increment") targetQty += 1;
    if (action === "decrement") targetQty -= 1;

    // Automatic purge if bounds fall under zero metrics limit
    if (targetQty <= 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      });
      return NextResponse.json({ success: true, message: "Item completely dropped from collection matrix." });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: targetQty },
      include: { inventory: true }
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

// -----------------------------------------------------------------
// 4. DELETE: Drop Specific Row Target completely (Trashbin icon)
// -----------------------------------------------------------------
export async function DELETE(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);
    const body = await req.json();
    const { cartItemId } = body;

    if (!cartItemId) {
      return NextResponse.json({ success: false, message: "Cart Item ID missing parameter token." }, { status: 400 });
    }

    const targetRow = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    });

    if (!targetRow || targetRow.userId !== userId) {
      return NextResponse.json({ success: false, message: "Action unauthorized on verified item matrix index." }, { status: 403 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    return NextResponse.json({ success: true, message: "Item purged from cart cluster database." });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}