import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function getUserIdFromToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cookieHeader = req.headers.get("cookie");

  let token: string | null = null;

  // 1. Bearer token
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Cookie fallback
  if (!token && cookieHeader) {
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    token = match?.[1] ?? null;
  }

  if (!token) {
    throw new Error("Unauthorized: No token found");
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    if (!payload?.id) {
      throw new Error("Invalid token payload");
    }

    return payload.id as string;
  } catch (err) {
    throw new Error("Unauthorized: Invalid token");
  }
}