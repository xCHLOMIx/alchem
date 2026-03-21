import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUserFromRequest } from "@/lib/auth";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = getCurrentUserFromRequest(req);

    if (!user || user.role !== "wholesaler") {
      return NextResponse.json(
        { error: "Only the ordering wholesaler can complete orders" },
        { status: 403 },
      );
    }

    const body = (await req.json()) as { orderId: string };
    if (!body.orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await Order.findOne({
      _id: body.orderId,
      wholesalerId: new Types.ObjectId(user.userId),
      status: "in_delivery",
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not owned by you" },
        { status: 404 },
      );
    }

    order.status = "completed";
    await order.save();

    return NextResponse.json({ message: "Order completed", order });
  } catch {
    return NextResponse.json({ error: "Failed to complete order" }, { status: 500 });
  }
}
