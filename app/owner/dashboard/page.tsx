import { DashboardHeader } from "../../../components/owner-dashboard/dashboard-header";
import { DashboardOverview } from "../../../components/owner-dashboard/dashboard-overview";
import { OwnerSidebar } from "../../../components/owner-dashboard/owner-sidebar";
import { prisma } from "../../../lib/prisma";
import { getCurrentSession } from "../../../lib/session";

function formatAppointment(date: Date | null) {
  if (!date) return "None scheduled";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function OwnerDashboardPage() {
  const session = await getCurrentSession();
  const userId = BigInt(session!.sub);

  const [user, owner, unreadMessages] = await Promise.all([
    prisma.users.findUnique({
      where: { user_id: userId },
      select: { first_name: true, last_name: true },
    }),
    prisma.pet_owner.findUnique({
      where: { user_id: userId },
      select: {
        booking: {
          orderBy: { booking_date: "desc" },
          take: 5,
          select: {
            booking_id: true,
            status: true,
            start_date: true,
            total_amount: true,
            pet: { select: { pet_name: true } },
            pet_sitter: {
              select: {
                users: { select: { first_name: true, last_name: true } },
              },
            },
            service_type: { select: { name: true } },
          },
        },
      },
    }),
    prisma.message.count({
      where: { receiver_id: userId, is_read: false },
    }),
  ]);

  const userName = `${user?.first_name || "Pet"} ${user?.last_name || "Owner"}`.trim();
  const bookings = owner?.booking ?? [];
  const activeBookings = bookings.filter((booking) =>
    ["pending", "confirmed", "upcoming"].includes(booking.status.toLowerCase())
  ).length;
  const nextBooking = bookings
    .filter((booking) => booking.start_date && booking.start_date >= new Date())
    .sort((left, right) => left.start_date!.getTime() - right.start_date!.getTime())[0];

  const recentBookings = bookings.map((booking) => ({
    id: booking.booking_id.toString(),
    sitter: booking.pet_sitter
      ? `${booking.pet_sitter.users.first_name} ${booking.pet_sitter.users.last_name}`.trim()
      : "Awaiting sitter",
    pet: booking.pet.pet_name,
    service: booking.service_type?.name || "Pet care",
    date: formatAppointment(booking.start_date),
    status: booking.status,
    amount: booking.total_amount ? `Rs. ${booking.total_amount.toString()}` : "Pending",
  }));

  return (
    <div className="flex min-h-screen bg-[#FFF8F7]">
      <OwnerSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader userName={userName} />
        <DashboardOverview
          userName={user?.first_name || "Pet Owner"}
          activeBookings={activeBookings}
          unreadMessages={unreadMessages}
          nextAppointment={formatAppointment(nextBooking?.start_date ?? null)}
          recentBookings={recentBookings}
        />
      </div>
    </div>
  );
}
