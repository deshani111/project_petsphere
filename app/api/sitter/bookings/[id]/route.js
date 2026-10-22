import { NextResponse } from "next/server";
import { getCurrentSitter } from "../../../../../modules/sitter/sitter.service";
import {
  formatBooking,
  getSitterBooking,
  updateSitterBookingStatus,
} from "../../../../../modules/bookings/booking.service";

export async function GET(_, { params }) {
  const sitter = await getCurrentSitter();
  if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });

  const booking = await getSitterBooking(sitter.sitter_id, (await params).id);
  return booking
    ? NextResponse.json({ booking: formatBooking(booking) })
    : NextResponse.json({ message: "Booking not found." }, { status: 404 });
}

export async function PATCH(request, { params }) {
  const sitter = await getCurrentSitter();
  if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const result = await updateSitterBookingStatus(sitter.sitter_id, (await params).id, body.status);
  if (result.error) return NextResponse.json({ message: result.error }, { status: result.status });
  return NextResponse.json({ booking: result.booking });
}
