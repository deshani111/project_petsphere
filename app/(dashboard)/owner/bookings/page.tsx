import Link from "next/link";
import { DashboardHeader } from "../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../components/owner-dashboard/owner-sidebar";
import { prisma } from "../../../../lib/prisma";
import { getCurrentSession } from "../../../../lib/session";

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

  const userName = `${user?.first_name || "Pet"} ${user?.last_name || "Owner"}`.trim();
  const bookings = user?.pet_owner?.booking ?? [];

  return (
    <div className="flex min-h-screen bg-[#fff8f7]">
      <OwnerSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader userName={userName} />
        <main className="mx-auto max-w-6xl px-5 py-9">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#ab3d42]">Owner dashboard</p>
              <h1 className="mt-2 text-3xl font-bold text-[#30272a]">My Bookings</h1>
              <p className="mt-2 text-sm text-[#887c7d]">View and manage your pet-care bookings.</p>
            </div>
            <Link href="/owner/bookings/new" className="rounded-lg bg-[#ab3d42] px-5 py-3 text-sm font-semibold text-white">New booking</Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#efdddd] bg-white">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-[#fff5f4] text-xs uppercase tracking-wider text-[#705e60]">
                <tr><th className="px-4 py-3">Sitter</th><th className="px-4 py-3">Pet</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Amount</th></tr>
              </thead>
              <tbody className="divide-y divide-[#f3e9e7]">
                {bookings.map((booking) => (
                  <tr key={booking.booking_id.toString()}>
                    <td className="px-4 py-4 font-medium">{booking.pet_sitter ? `${booking.pet_sitter.users.first_name} ${booking.pet_sitter.users.last_name}` : "Awaiting sitter"}</td>
                    <td className="px-4 py-4">{booking.pet.pet_name}</td>
                    <td className="px-4 py-4">{booking.service_type?.name || "Pet care"}</td>
                    <td className="px-4 py-4">{formatDate(booking.start_date)}{booking.end_date ? ` – ${formatDate(booking.end_date)}` : ""}</td>
                    <td className="px-4 py-4"><span className="rounded-full bg-[#fff0ef] px-3 py-1 text-xs font-semibold capitalize text-[#ab3d42]">{booking.status}</span></td>
                    <td className="px-4 py-4 text-right font-semibold">{booking.total_amount ? `Rs. ${booking.total_amount.toString()}` : "Pending"}</td>
                  </tr>
                ))}
                {bookings.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-[#887c7d]">You have no bookings yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
