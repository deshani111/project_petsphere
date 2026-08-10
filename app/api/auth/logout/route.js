import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../../modules/auth/auth.service";
export async function POST() { const response = NextResponse.json({ message: "Logged out." }); response.cookies.set({ name: SESSION_COOKIE_NAME, value: "", path: "/", maxAge: 0 }); return response; }
