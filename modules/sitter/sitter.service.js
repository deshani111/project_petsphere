import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../auth/auth.service";

const BOOKING_STATUSES = new Set(["pending", "confirmed", "in_progress", "completed", "cancelled", "rejected"]);

export async function getCurrentSitter() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session || session.role !== "pet_sitter") return null;
  return prisma.pet_sitter.findUnique({
    where: { user_id: BigInt(session.sub) },
    include: { users: true },
  });
}

export function serialize(value) {
  return JSON.parse(JSON.stringify(value, (_, item) =>
    typeof item === "bigint" ? item.toString() : item
  ));
}

export function formatBooking(booking) {
  return {
    id: booking.booking_id.toString(), status: booking.status,
    startDate: booking.start_date?.toISOString() ?? null,
    endDate: booking.end_date?.toISOString() ?? null,
    amount: Number(booking.total_amount ?? 0), notes: booking.notes ?? "",
    createdAt: booking.created_at.toISOString(),
    pet: { name: booking.pet.pet_name, species: booking.pet.species, breed: booking.pet.breed, photo: booking.pet.photo },
    owner: { name: `${booking.pet_owner.users.first_name} ${booking.pet_owner.users.last_name}`.trim(), phone: booking.pet_owner.users.phone_number },
    service: booking.service_type?.name ?? "Pet care",
  };
}

export async function getSitterBookings(sitter, where = {}) {
  const rows = await prisma.booking.findMany({
    where: { sitter_id: sitter.sitter_id, ...where }, orderBy: { start_date: "asc" },
    include: { pet: true, pet_owner: { include: { users: { select: { first_name: true, last_name: true, phone_number: true } } } }, service_type: true },
  });
  return rows.map(formatBooking);
}

export function validStatus(value) { return typeof value === "string" && BOOKING_STATUSES.has(value); }
