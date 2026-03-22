import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUserFromRequest } from "@/lib/auth";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const mine = req.nextUrl.searchParams.get("mine") === "true";
    if (mine) {
      const user = getCurrentUserFromRequest(req);
      if (!user || user.role !== "farmer") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const products = await Product.find({ farmerId: user.userId })
        .sort({ createdAt: -1 })
        .lean();
      return NextResponse.json({ products });
    }

    const products = await Product.find({})
      .populate("farmerId", "name phone district")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = getCurrentUserFromRequest(req);
    if (!user || user.role !== "farmer") {
      return NextResponse.json({ error: "Only farmers can post products" }, { status: 403 });
    }

    const body = (await req.json()) as {
      name: string;
      quantity: number;
      unit: string;
      price: number;
      district?: string;
    };

    if (!body.name || !body.quantity || !body.unit || !body.price) {
      return NextResponse.json(
        { error: "name, quantity, unit and price/unit are required" },
        { status: 400 },
      );
    }

    const product = await Product.create({
      farmerId: new Types.ObjectId(user.userId),
      name: body.name,
      quantity: Number(body.quantity),
      unit: body.unit,
      price: Number(body.price),
      district: body.district || "",
    });

    return NextResponse.json({ message: "Product created", product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
