import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// Auth guard token validation ke liye
async function getUser(req: Request) {
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
  return payload;
}

export async function POST(req: Request) {
  try {
    // 1️⃣ Auth Check
    await getUser(req);

    // 2️⃣ Get Status Data
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, message: "Missing id or status" }, { status: 400 });
    }

    // 3️⃣ Update in Prisma Database
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { status: status }, // Make sure your DB model schema allows: Pending, Approved, Rejected, Packed, Shipped
    });

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status} successfully.`,
      data: updatedOrder,
    });
  } catch (err: any) {
    console.error("❌ STATUS UPDATE ERROR:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}