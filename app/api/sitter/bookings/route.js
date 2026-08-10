import { NextResponse } from "next/server";
import { getCurrentSitter, getSitterBookings } from "../../../../modules/sitter/sitter.service";
export async function GET(request) {
 const sitter = await getCurrentSitter(); if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
 const status = new URL(request.url).searchParams.get("status");
 return NextResponse.json({ bookings: await getSitterBookings(sitter, status ? { status } : {}) });
}
