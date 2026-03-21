import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUserFromRequest } from "@/lib/auth";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = getCurrentUserFromRequest(req);

    if (!user || user.role !== "transporter") {
      return NextResponse.json(
        { error: "Only transporters can accept orders" },
        { status: 403 },
      );
    }

    const body = (await req.json()) as { orderId: string };
    if (!body.orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await Order.findOne({
      _id: body.orderId,
      status: "awaiting_transport",
      transporterId: { $exists: false },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order is not available for acceptance" },
        { status: 404 },
      );
    }

    order.transporterId = new Types.ObjectId(user.userId);
    order.status = "in_delivery";
    await order.save();

    return NextResponse.json({ message: "Order accepted", order });
  } catch {
    return NextResponse.json({ error: "Failed to accept order" }, { status: 500 });
  }
}
