import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import nodemailer from "nodemailer";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// ======================
// AUTH GUARD
// ======================
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
    throw new Error("Unauthorized");
  }

  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function POST(req: Request) {
  try {
    // ======================
    // AUTH CHECK
    // ======================
    await getUser(req);

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing id or status",
        },
        { status: 400 }
      );
    }

    // ======================
    // FIND ORDER + CLIENT
    // ======================
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    const oldStatus = order.status;

    // ======================
    // UPDATE STATUS
    // ======================
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
      },
    });

    // ======================
    // SEND EMAIL IF STATUS CHANGED
    // ======================
    if (oldStatus !== status && order.client?.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Status Badge Color Logic (Optional, dynamically matches colors)
      const getStatusColor = (s: string) => {
        const lower = s.toLowerCase();
        if (lower.includes("deliver") || lower.includes("success") || lower.includes("confirm")) return "#10B981"; // Green
        if (lower.includes("pend") || lower.includes("process")) return "#F59E0B"; // Amber
        if (lower.includes("cancel") || lower.includes("fail")) return "#EF4444"; // Red
        return "#6B7280"; // Gray
      };

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: order.client.email,
        subject: `Order #${order.orderNumber} Status Updated`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Status Update</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f9fc; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <!-- Main Card -->
                  <table width="100%" id="content-table" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border-collapse: collapse;">
                    
                    <!-- Header Banner -->
                    <tr>
                      <td style="background-color: #4F46E5; padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Order Status Updated</h1>
                        <p style="color: #E0E7FF; margin: 10px 0 0 0; font-size: 15px;">Your order sequence has progressed.</p>
                      </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                      <td style="padding: 35px 30px;">
                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #334155;">
                          Hello <strong>${order.client.name || "Customer"}</strong>,
                        </p>
                        <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.5; color: #475569;">
                          We are writing to let you know that the status of your order <strong>#${order.orderNumber}</strong> has been updated by our team.
                        </p>

                        <!-- Details Box -->
                        <table width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; border-collapse: separate; padding: 20px; margin-bottom: 30px;">
                          <tr>
                            <td style="padding-bottom: 12px; font-size: 14px; color: #64748B;" width="40%"><strong>Order Number:</strong></td>
                            <td style="padding-bottom: 12px; font-size: 14px; color: #0F172A; font-weight: 600;">#${order.orderNumber}</td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: 12px; font-size: 14px; color: #64748B;"><strong>Event Name:</strong></td>
                            <td style="padding-bottom: 12px; font-size: 14px; color: #0F172A;">${order.eventName}</td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: 12px; font-size: 14px; color: #64748B;"><strong>Previous Status:</strong></td>
                            <td style="padding-bottom: 12px; font-size: 14px; color: #EF4444;"><strike>${oldStatus}</strike></td>
                          </tr>
                          <tr>
                            <td style="font-size: 14px; color: #64748B;"><strong>New Status:</strong></td>
                            <td>
                              <span style="background-color: ${getStatusColor(status)}; color: #ffffff; padding: 4px 10px; border-radius: 50px; font-size: 12px; font-weight: 700; text-transform: uppercase; display: inline-block; letter-spacing: 0.5px;">
                                ${status}
                              </span>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 0 0 5px 0; font-size: 15px; color: #475569;">Thank you for your business!</p>
                        <p style="margin: 0; font-size: 15px; color: #0F172A; font-weight: 600;">The Team</p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #F1F5F9; padding: 20px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
                        <p style="margin: 0; font-size: 12px; color: #94A3B8;">
                          This is an automated operational email. Please do not reply directly to this message.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status} successfully.`,
      data: updatedOrder,
    });
  } catch (err: any) {
    console.error("❌ STATUS UPDATE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}