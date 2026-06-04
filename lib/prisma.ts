import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables. Please check your .env file.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // yahan .env ka DATABASE_URL use hoga
});

const adapter = new PrismaPg(pool);

// Global instance for dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ✅ Optional: connection test
(async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed", err);
  }
})();
export default prisma; 