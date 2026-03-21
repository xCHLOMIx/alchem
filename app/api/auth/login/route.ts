import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { AUTH_COOKIE_NAME, createAuthToken } from "@/lib/auth";
import User from "@/models/User";

type LoginBody = {
  phone: string;
  password: string;
};

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as LoginBody;

    if (!body.phone || !body.password) {
      return NextResponse.json(
        { error: "phone and password are required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ phone: body.phone });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(body.password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createAuthToken({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      phone: user.phone,
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        _id: user._id,
        role: user.role,
        name: user.name,
        phone: user.phone,
        district: user.district,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
