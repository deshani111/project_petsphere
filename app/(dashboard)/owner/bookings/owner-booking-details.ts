import { prisma } from "../../../../lib/prisma";
import { getCurrentSession } from "../../../../lib/session";
import type { DetailsBooking } from "./[bookingId]/booking-details";

const dateLabel = (date: Date | null) => date
  ? new Intl.DateTimeFormat("en-LK", { dateStyle: "medium", timeZone: "UTC" }).format(date)
  : "To be arranged";

export async function loadOwnerBookingDetails(id: string) {
  if (!/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > BigInt("9223372036854775807")) return null;
  const session = await getCurrentSession();
  if (session?.role !== "pet_owner") return null;
  const row = await prisma.booking.findFirst({
    where: { booking_id: BigInt(id), pet_owner: { user_id: BigInt(session.sub) } },
    select: {
      status: true, start_date: true, end_date: true, notes: true, total_amount: true,
      pet: { select: { pet_name: true } }, service_type: { select: { name: true } },
      pet_sitter: { select: { service_area: true, avg_rating: true, users: { select: { first_name: true, last_name: true } } } },
    },
  });
  if (!row) return null;
  const sitter = row.pet_sitter?.users;
  const name = sitter ? [sitter.first_name, sitter.last_name].filter(Boolean).join(" ") : "Awaiting sitter";
  const statuses: Record<string, DetailsBooking["status"]> = {
    pending: "Pending", confirmed: "Confirmed", in_progress: "In Progress",
    completed: "Completed", cancelled: "Cancelled", rejected: "Rejected",
  };
  const booking: DetailsBooking = {
    bookingNumber: "#" + id, sitter: name, initials: sitter ? (sitter.first_name[0] ?? "") + (sitter.last_name[0] ?? "") : "—",
    rating: row.pet_sitter?.avg_rating?.toString() ?? "", reviews: "",
    service: row.service_type?.name ?? "Pet care", pet: row.pet.pet_name,
    startDate: dateLabel(row.start_date), endDate: dateLabel(row.end_date),
    nights: row.start_date && row.end_date ? Math.max(0, Math.round((+row.end_date - +row.start_date) / 86400000)) : 0,
    status: statuses[row.status] ?? "Pending",
    price: row.total_amount == null ? "Pending" : "Rs. " + Number(row.total_amount).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    serviceAmount: "", platformFee: "", taxes: "",
    specialInstructions: row.notes ?? "", location: row.pet_sitter?.service_area ?? "To be arranged",
  };
  return { booking, hasSitter: Boolean(sitter) };
}

