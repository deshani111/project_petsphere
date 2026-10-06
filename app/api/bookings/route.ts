import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentOwnerId } from "../../../lib/session";

const PRICES: Record<string, number> = {
  boarding: 8500,
  walking: 4000,
  grooming: 6000,
  training: 5000,
};

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

  const service =
    typeof body.service === "string" ? body.service.toLowerCase() : "";

  const petId =
    typeof body.petId === "string" && /^\d+$/.test(body.petId)
      ? BigInt(body.petId)
      : null;

  const startDate =
    typeof body.startDate === "string"
      ? new Date(body.startDate)
      : null;

  const endDate =
    typeof body.endDate === "string" && body.endDate
      ? new Date(body.endDate)
      : null;

  const notes =
    typeof body.notes === "string"
      ? body.notes.trim()
      : "";

  if (
    !petId ||
    !PRICES[service] ||
    !startDate ||
    Number.isNaN(startDate.getTime())
  ) {
    return NextResponse.json(
      { message: "Please complete the service, pet, and date steps." },
      { status: 400 }
    );
  }

  if (
    endDate &&
    (Number.isNaN(endDate.getTime()) || endDate < startDate)
  ) {
    return NextResponse.json(
      { message: "Please select a valid date range." },
      { status: 400 }
    );
  }

  const pet = await prisma.pet.findFirst({
    where: {
      pet_id: petId,
      owner_id: ownerId,
    },
    select: {
      pet_id: true,
    },
  });

  if (!pet) {
    return NextResponse.json(
      { message: "The selected pet does not belong to this account." },
      { status: 403 }
    );
  }

  const serviceType = await prisma.service_type.findFirst({
    where: {
      name: {
        equals: service,
        mode: "insensitive",
      },
    },
    select: {
      service_type_id: true,
    },
  });

  const days = endDate
    ? Math.max(
        1,
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / 86_400_000
        )
      )
    : 1;

  const booking = await prisma.booking.create({
    data: {
      owner_id: ownerId,
      pet_id: petId,
      service_type_id: serviceType?.service_type_id,
      start_date: startDate,
      end_date: endDate,
      notes: notes || null,
      status: "pending",
      total_amount:
        PRICES[service] * (service === "boarding" ? days : 1),
    },
    select: {
      booking_id: true,
    },
  });

  return NextResponse.json(
    {
      message: "Booking request created successfully.",
      bookingId: booking.booking_id.toString(),
    },
    { status: 201 }
  );
}