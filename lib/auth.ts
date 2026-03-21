import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "prototype-secret";

export const AUTH_COOKIE_NAME = "agri_token";

export type SessionUser = {
  userId: string;
  role: "farmer" | "wholesaler" | "transporter";
  name: string;
  phone: string;
};

export function createAuthToken(user: SessionUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function getCurrentUserFromRequest(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}
