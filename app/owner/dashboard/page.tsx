import { DashboardHeader } from "../../../components/owner-dashboard/dashboard-header";
import { DashboardOverview, type DashboardBooking } from "../../../components/owner-dashboard/dashboard-overview";
import { getCurrentSession } from "../../../lib/session";
import { OwnerSidebar } from "../../../components/owner-dashboard/owner-sidebar";
import { prisma } from "../../../lib/prisma";

export default async function OwnerDashboardPage() {
  const session = await getCurrentSession();
  if (!session) return null; // The owner layout redirects unauthenticated visitors.
  const userId = BigInt(session.sub);

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
          select: {
            booking_id: true,
            status: true,
            start_date: true,
            end_date: true,
            total_amount: true,
            pet: { select: { pet_name: true } },
            pet_sitter: {
              select: {
                users: { select: { first_name: true, last_name: true} },
              },
            },
            service_type: { select: { name: true } },
          },
        },
      },
    }),
    prisma.message.count({ where: { receiver_id: userId, is_read: false } }),
  ]);

  const userName = `${user?.first_name || "Pet"} ${user?.last_name || "Owner"}`.trim();
  const bookings = owner?.booking ?? [];
  // These are the active values already used by the owner dashboard's business logic.
  const activeBookings = bookings.filter((booking) => ["pending", "confirmed", "upcoming"].includes(booking.status.toLowerCase())).length;
  const dashboardBookings: DashboardBooking[] = bookings.map((booking) => ({
    id: booking.booking_id.toString(),
    sitter: booking.pet_sitter
      ? `${booking.pet_sitter.users.first_name} ${booking.pet_sitter.users.last_name}`.trim()
      : "Awaiting sitter",
    sitterImage: null,
    pet: booking.pet.pet_name,
    service: booking.service_type?.name || "Pet care",
    date: booking.start_date?.toISOString() ?? null,
    endDate: booking.end_date?.toISOString() ?? null,
    status: booking.status,
    amount: booking.total_amount ? `Rs. ${booking.total_amount.toString()}` : "Pending",
  }));

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f9] lg:flex-row">
      <OwnerSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader userName={userName} userImage={null} unreadMessages={unreadMessages} />
        <DashboardOverview
          userName={userName}
          activeBookings={activeBookings}
          totalBookings={bookings.length}
          unreadMessages={unreadMessages}
          bookings={dashboardBookings}
        />
      </div>
    </div>
  );
}
