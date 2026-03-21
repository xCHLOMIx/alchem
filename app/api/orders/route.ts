import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUserFromRequest } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let filter: Record<string, unknown> = {};

    if (user.role === "farmer") {
      filter = { farmerId: user.userId };
    }

    if (user.role === "wholesaler") {
      filter = { wholesalerId: user.userId };
    }

    if (user.role === "transporter") {
      filter = {
        $or: [{ status: "awaiting_transport" }, { transporterId: user.userId }],
      };
    }

    const orders = await Order.find(filter)
      .populate("productId", "name unit price district")
      .populate("farmerId", "name phone district")
      .populate("wholesalerId", "name phone companyName district")
      .populate("transporterId", "name phone carPlateNumber")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = getCurrentUserFromRequest(req);
    if (!user || user.role !== "wholesaler") {
      return NextResponse.json(
        { error: "Only wholesalers can create orders" },
        { status: 403 },
      );
    }

    const body = (await req.json()) as {
      productId: string;
      quantity: number;
    };

    if (!body.productId || !body.quantity) {
      return NextResponse.json(
        { error: "productId and quantity are required" },
        { status: 400 },
      );
    }

    const quantity = Number(body.quantity);
    if (Number.isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "quantity must be a positive number" },
        { status: 400 },
      );
    }

    const product = await Product.findById(body.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const totalPrice = quantity * product.price;

    const order = await Order.create({
      productId: new Types.ObjectId(body.productId),
      farmerId: product.farmerId,
      wholesalerId: new Types.ObjectId(user.userId),
      quantity,
      totalPrice,
      status: "awaiting_transport",
    });

    return NextResponse.json({ message: "Order created", order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
