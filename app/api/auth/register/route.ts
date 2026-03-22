import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User, { type UserRole } from "@/models/User";

type RegisterBody = {
  role: UserRole;
  name: string;
  phone: string;
  password: string;
  district: string;
  idNumber?: string;
  vehiclePlateNumber?: string;
  carPlateNumber?: string;
  companyName?: string;
};

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as RegisterBody;

    const { role, name, phone, password, district } = body;
    if (!role || !name || !phone || !password || !district) {
      return NextResponse.json(
        { error: "role, name, phone, password and district are required" },
        { status: 400 },
      );
    }

    const vehiclePlateNumber = body.vehiclePlateNumber || body.carPlateNumber;

    if (role === "transporter" && (!body.idNumber || !vehiclePlateNumber)) {
      return NextResponse.json(
        { error: "idNumber and vehiclePlateNumber are required for transporter" },
        { status: 400 },
      );
    }

    if (role === "wholesaler" && !body.companyName) {
      return NextResponse.json(
        { error: "companyName is required for wholesaler" },
        { status: 400 },
      );
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return NextResponse.json(
        { error: "Phone number is already registered" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      role,
      name,
      phone,
      password: hashedPassword,
      district,
      idNumber: body.idNumber,
      carPlateNumber: vehiclePlateNumber,
      companyName: body.companyName,
    });

    return NextResponse.json(
      {
        message: "Registered successfully",
        user: {
          _id: user._id,
          role: user.role,
          name: user.name,
          phone: user.phone,
          district: user.district,
          idNumber: user.idNumber,
          vehiclePlateNumber: user.carPlateNumber,
          companyName: user.companyName,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Register error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "ECONNREFUSED" &&
      "syscall" in error &&
      (error as { syscall?: string }).syscall === "querySrv"
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot resolve MongoDB Atlas SRV DNS. Use a non-SRV mongodb:// URI or a local MongoDB URI for development.",
        },
        { status: 500 },
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 8000
    ) {
      return NextResponse.json(
        {
          error:
            "MongoDB authentication failed. Verify Atlas database username/password and URL-encode special characters in the password.",
        },
        { status: 500 },
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "Phone number is already registered" },
        { status: 409 },
      );
    }

    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to register user";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
