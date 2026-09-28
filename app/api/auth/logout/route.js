import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../../modules/auth/auth.service";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
