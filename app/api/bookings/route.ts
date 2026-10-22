import { NextResponse } from "next/server";
import { getCurrentOwnerId } from "../../../lib/session";
import { createOwnerBooking } from "../../../modules/bookings/booking.service";

export async function POST(request: Request) {
  const ownerId = await getCurrentOwnerId();

  if (!ownerId) {
    return NextResponse.json(
      { message: "Please log in as a pet owner." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Please submit valid booking details." },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await createOwnerBooking(ownerId, body);
  } catch (error) {
    console.error("Could not create booking:", error);
    return NextResponse.json(
      { message: "Could not create booking. Please try again." },
      { status: 500 }
    );
  }
  if (result.error) return NextResponse.json({ message: result.error }, { status: result.status });

  return NextResponse.json(
    {
      message: "Booking request created successfully.",
      bookingId: result.bookingId,
    },
    { status: 201 }
  );
}