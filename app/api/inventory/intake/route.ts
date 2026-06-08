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
    const clientId = formData.get("clientId") as string;


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
        clientId: clientId || null,
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
    const user = await getUser(req);

    const inventoryItems = await prisma.inventory.findMany({
  where: {
    createdById: user.id,
    isDeleted: false,
  },
  select: {
    id: true,
    name: true,
    sku: true,
    bin: true,
    quantity: true,
    condition: true,
    description: true,
    images: true,
    stockStatus: true,

    createdBy: {
      select: {
        name: true,
        email: true,
      },
    },

    client: {
      select: {
        name: true,
        email: true,
      },
    },
  },
});

    return NextResponse.json({
      success: true,
      data: inventoryItems,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUser(req);

    // 1️⃣ Check Role Permissions
    if (!["CB", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 2️⃣ URL se item ID nikalein
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ success: false, message: "Item ID is required" }, { status: 400 });
    }

    // 3️⃣ Check karein ke item exist karta hai aur isi user ka hai
    const existingItem = await prisma.inventory.findFirst({
      where: { id: itemId, createdById: user.id },
    });

    if (!existingItem) {
      return NextResponse.json({ success: false, message: "Inventory item not found or unauthorized" }, { status: 404 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const bin = formData.get("bin") as string;
    const description = formData.get("description") as string;
    const condition = formData.get("condition") as string;
    const quantity = formData.get("quantity") ? Number(formData.get("quantity")) : undefined;

    // Pehle se maujood images ko maintain karne ke liye array (agar frontend se structural JSON bhejein)
    // Ya phir purani images default rakhein agar koi nayi image upload nahi ho rahi
    let finalImages = [...existingItem.images]; 

    const newImagesFiles = formData.getAll("images") as File[];
    const uploadedUrls: string[] = [];

    // Agar nayi files aayi hain to unhe upload karein
    for (const file of newImagesFiles) {
      if (file.size > 0) {
        try {
          const uploadedUrl = await uploadToCloudinary(file, "inventory-items");
          uploadedUrls.push(uploadedUrl);
        } catch (uploadError) {
          console.error("❌ Cloudinary update upload failed:", uploadError);
          throw new Error("Failed to upload new images.");
        }
      }
    }

    // Agar nayi images upload hui hain, to aap unhe override kar sakte hain ya append kar sakte hain
    if (uploadedUrls.length > 0) {
      finalImages = uploadedUrls; // Pura array naye uploads se replace kar rahe hain
    }

    // 4️⃣ Database update query
    const updatedInventory = await prisma.inventory.update({
      where: { id: itemId },
      data: {
        name: name || undefined,
        sku: sku || undefined,
        bin: bin || undefined,
        description: description || undefined,
        condition: condition || undefined,
        quantity: quantity,
        images: finalImages,
      },
    });

    return NextResponse.json({ success: true, data: updatedInventory }, { status: 200 });

  } catch (err: any) {
    console.error("❌ PUT INVENTORY ERROR:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Server Error during update" },
      { status: 500 }
    );
  }
}

// --- 🗑️ DELETE METHOD: Remove Inventory ---
// Iske liye aapke Prisma Schema mein `isDeleted Boolean @default(false)` hona zaroori hai.
export async function DELETE(req: Request) {
  try {
    const user = await getUser(req);

    if (!["CB", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ message: "Forbidden: Access Denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ success: false, message: "Item ID is required" }, { status: 400 });
    }

    const existingItem = await prisma.inventory.findFirst({
      where: { id: itemId, createdById: user.id },
    });

    if (!existingItem) {
      return NextResponse.json({ success: false, message: "Item not found or unauthorized" }, { status: 404 });
    }

    // 🔄 Soft Delete Action (Foreign key constraint trigger nahi hoga)
    await prisma.inventory.update({
      where: { id: itemId },
      data: { isDeleted: true },
    });

    return NextResponse.json(
      { success: true, message: "Inventory item archived and removed from active stock successfully." },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("❌ SOFT DELETE INVENTORY ERROR:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Server Error during archiving" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUser(req);

    if (!["CB", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: "Item ID is required" },
        { status: 400 }
      );
    }

    const existingItem = await prisma.inventory.findFirst({
      where: { id: itemId, createdById: user.id, isDeleted: false },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: "Item not found or unauthorized" },
        { status: 404 }
      );
    }

    const newStatus =
      existingItem.stockStatus === "IN_STOCK" ? "OUT_OF_STOCK" : "IN_STOCK";

    const updated = await prisma.inventory.update({
      where: { id: itemId },
      data: { stockStatus: newStatus,
        quantity: newStatus === "OUT_OF_STOCK" ? 0 : existingItem.quantity,
       },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server Error" },
      { status: 500 }
    );
  }
}