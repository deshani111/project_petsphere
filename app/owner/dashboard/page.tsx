
import {
  DashboardOverview,
  type DashboardBooking,
} from "../../../components/owner-dashboard/dashboard-overview";
import { getCurrentSession } from "../../../lib/session";
import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default async function OwnerDashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "pet_owner") {
    redirect("/");
  }

  const userId = BigInt(session.sub);

  const [user, owner, unreadMessages] = await Promise.all([
    prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        first_name: true,
        last_name: true,
      },
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
            pet: {
              select: {
                pet_name: true,
              },
            },
            pet_sitter: {
              select: {
                users: {
                  select: {
                    first_name: true,
                    last_name: true,
                  },
                },
              },
            },
            service_type: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),

    prisma.message.count({
      where: {
        receiver_id: userId,
        is_read: false,
      },
    }),
  ]);

  const userName =
    `${user?.first_name || "Pet"} ${
      user?.last_name || "Owner"
    }`.trim();

  const bookings = owner?.booking ?? [];

  // Count active bookings
  const activeBookings = bookings.filter((booking) =>
    ["pending", "confirmed", "upcoming"].includes(
      booking.status.toLowerCase()
    )
  ).length;

  // Convert database bookings into dashboard objects
  const dashboardBookings: DashboardBooking[] = bookings.map(
    (booking) => ({
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

      amount: booking.total_amount
        ? `Rs. ${booking.total_amount.toString()}`
        : "Pending",
    })
  );

  return (
    <DashboardOverview
      userName={userName}
      activeBookings={activeBookings}
      totalBookings={bookings.length}
      unreadMessages={unreadMessages}
      bookings={dashboardBookings}
    />
  );
}
