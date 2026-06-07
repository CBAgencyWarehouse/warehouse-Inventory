import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { uploadToCloudinary } from "@/lib/cloudinary"; // 👈 Cloudinary helper import kiya

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


  if (!token) {
    throw new Error("No token found");
  }

  const { payload } = await jwtVerify(token, secret);

  return payload as {
    id: string;
    role: string;
    email: string;
  };
}

export async function POST(req: Request) {
  try {
    const user = await getUser(req);

    if (!["CB", "ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { message: "Forbidden: insufficient permissions" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const bin = formData.get("bin") as string;
    const description = formData.get("description") as string;
    const condition = formData.get("condition") as string;
    const quantity = Number(formData.get("quantity"));


    const imagesFiles = formData.getAll("images") as File[];

    // 🚀 --- CLOUDINARY UPLOAD LOGIC START ---
    const imageUrls: string[] = [];

    for (const file of imagesFiles) {
      if (file.size > 0) {
        try {
          // Cloudinary pe upload karke secure URL le rahe hain
          const uploadedUrl = await uploadToCloudinary(file, "inventory-items");
          imageUrls.push(uploadedUrl);
        } catch (uploadError) {
          console.error(`❌ Cloudinary upload failed for ${file.name}:`, uploadError);
          // Aap chahein to throw kar sakte hain ya skip kar sakte hain
          throw new Error(`Failed to upload image: ${file.name}`);
        }
      }
    }
    // 🚀 --- CLOUDINARY UPLOAD LOGIC END ---

    // DB mein `images` field mein ab image ke real paths/URLs save honge
    const inventory = await prisma.inventory.create({
      data: {
        name,
        sku,
        bin,
        quantity,
        description,
        condition,
        images: imageUrls, // 👈 Saved full Cloudinary URLs here
        createdById: user.id,
      },
    });


    return NextResponse.json(
      {
        success: true,
        data: inventory,
      },
      { status: 201 }
    );
  } catch (err: any) {

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Server Error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // 1️⃣ Cookie ya Header se token lekar user nikalenge
    const user = await getUser(req);

    console.log(`🔍 Fetching personal inventory for user: ${user.email} (ID: ${user.id})`);

    // 2️⃣ Prisma query mein 'where' filter lagayein taaki sirf isi user ka data aaye
    const inventoryItems = await prisma.inventory.findMany({
      where: {
        createdById: user.id, // 👈 Sirf wahi items aayenge jahan createdById current user ki ID se match karega
      },
      orderBy: {
        createdAt: "desc", // Naya uploaded data sabse upar dikhega
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: inventoryItems.length,
        data: inventoryItems,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ GET INVENTORY ERROR:", err.message);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Server Error while fetching inventory",
      },
      { status: 500 }
    );
  }
}