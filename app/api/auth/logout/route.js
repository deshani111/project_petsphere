import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../../modules/auth/auth.service";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully." });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
