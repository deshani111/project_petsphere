import Link from "next/link";
import { prisma } from "../../../../lib/prisma";
import { getCurrentSession } from "../../../../lib/session";
import { bookings as decoyBookings } from "../../../../lib/mock-bookings";
import { BookingTable } from "./booking-table";

function formatDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)
    : "Not scheduled";
}

export default async function OwnerBookingsPage() {
  const session = await getCurrentSession();
  const userId = BigInt(session!.sub);
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      first_name: true,
      last_name: true,
      pet_owner: {
        select: {
          booking: {
            orderBy: { booking_date: "desc" },
            select: {
              booking_id: true,
              status: true,
              start_date: true,
              end_date: true,
              total_amount: true,
              pet: { select: { pet_name: true } },
              service_type: { select: { name: true } },
              pet_sitter: { select: { users: { select: { first_name: true, last_name: true } } } },
            },
          },
        },
      },
    },
  });

  const bookings = user?.pet_owner?.booking ?? [];
  const bookingRows = bookings.map((booking) => ({
    id: booking.booking_id.toString(),
    sitter: booking.pet_sitter
      ? `${booking.pet_sitter.users.first_name} ${booking.pet_sitter.users.last_name}`
      : "Awaiting sitter",
    pet: booking.pet.pet_name,
    service: booking.service_type?.name || "Pet care",
    dates: `${formatDate(booking.start_date)}${booking.end_date ? ` – ${formatDate(booking.end_date)}` : ""}`,
    status: booking.status,
    amount: booking.total_amount ? `Rs. ${booking.total_amount.toString()}` : "Pending",
  }));
  const demoBookings = decoyBookings.slice(0, 4).map((booking) => ({
    id: booking.id,
    sitter: booking.sitter,
    pet: booking.pet,
    service: booking.service,
    dates: booking.dates,
    status: booking.status,
    amount: booking.price,
  }));

  return (
    <main className="mx-auto max-w-6xl px-5 py-9">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#ab3d42]">Owner dashboard</p>
              <h1 className="mt-2 text-3xl font-bold text-[#30272a]">My Bookings</h1>
              <p className="mt-2 text-sm text-[#887c7d]">View and manage your pet-care bookings.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/owner/payments" className="rounded-lg border border-[#ab3d42] bg-white px-5 py-3 text-sm font-semibold text-[#ab3d42] transition hover:bg-[#fff4f2]">Payment History</Link>
              <Link href="/owner/bookings/new" className="rounded-lg bg-[#ab3d42] px-5 py-3 text-sm font-semibold text-white">New booking</Link>
            </div>
          </div>

          <BookingTable bookings={[...bookingRows, ...demoBookings]} />
    </main>
  );
}
