import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentSitter, formatBooking, validStatus } from "../../../../../modules/sitter/sitter.service";

const allowedTransitions = { pending: ["confirmed", "rejected", "cancelled"], confirmed: ["in_progress", "cancelled"], in_progress: ["completed", "cancelled"], completed: [], rejected: [], cancelled: [] };
const include = { pet: true, pet_owner: { include: { users: { select: { first_name: true, last_name: true, phone_number: true } } } }, service_type: true };
export async function GET(_, { params }) { const sitter = await getCurrentSitter(); if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 }); const booking = await prisma.booking.findFirst({ where: { booking_id: BigInt((await params).id), sitter_id: sitter.sitter_id }, include }); return booking ? NextResponse.json({ booking: formatBooking(booking) }) : NextResponse.json({ message: "Booking not found." }, { status: 404 }); }
export async function PATCH(request, { params }) {
 const sitter = await getCurrentSitter(); if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
 let body; try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
 if (!validStatus(body.status)) return NextResponse.json({ message: "Invalid booking status." }, { status: 400 });
 const id = BigInt((await params).id); const existing = await prisma.booking.findFirst({ where: { booking_id: id, sitter_id: sitter.sitter_id } });
 if (!existing) return NextResponse.json({ message: "Booking not found." }, { status: 404 });
 if (!allowedTransitions[existing.status]?.includes(body.status)) return NextResponse.json({ message: "That booking status change is not allowed." }, { status: 409 });
 const booking = await prisma.$transaction(async (tx) => { const updated = await tx.booking.update({ where: { booking_id: id }, data: { status: body.status }, include }); await tx.notification.create({ data: { user_id: existing.owner_id, type: "booking_status", message: `Your booking has been ${body.status}.` } }); return updated; });
 return NextResponse.json({ booking: formatBooking(booking) });
}
