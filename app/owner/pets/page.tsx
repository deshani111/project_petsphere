import { redirect } from "next/navigation";
import { DashboardHeader } from "../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../components/owner-dashboard/owner-sidebar";
import { PetFamilyPage } from "../../../components/owner-dashboard/pet-family-page";
import { prisma } from "../../../lib/prisma";
import { getCurrentSession } from "../../../lib/session";

const UPCOMING_STATUSES = ["pending", "confirmed", "upcoming"];

export default async function OwnerPetsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role !== "pet_owner") redirect("/");
  const userId = BigInt(session.sub);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [user, owner, unreadMessages] = await Promise.all([
    prisma.users.findUnique({
      where: { user_id: userId },
      select: { first_name: true, last_name: true },
    }),
    prisma.pet_owner.findUnique({
      where: { user_id: userId },
      select: {
        booking: {
          where: { start_date: { gte: today } },
          orderBy: { start_date: "asc" },
          select: { status: true, start_date: true },
        },
      },
    }),
    prisma.message.count({ where: { receiver_id: userId, is_read: false } }),
  ]);

  const upcomingBookings = (owner?.booking ?? []).filter((booking) =>
    UPCOMING_STATUSES.includes(booking.status.toLowerCase())
  );
  const userName = `${user?.first_name || "Pet"} ${user?.last_name || "Owner"}`.trim();

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f9] lg:flex-row">
      <OwnerSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader userName={userName} userImage={null} unreadMessages={unreadMessages} />
        <PetFamilyPage
          upcomingBookingCount={upcomingBookings.length}
          nextBookingDate={upcomingBookings[0]?.start_date?.toISOString() ?? null}
        />
      </div>
    </div>
  );
}
