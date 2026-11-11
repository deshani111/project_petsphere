
import { redirect } from "next/navigation";
import { PetFamilyPage } from "../../../components/owner-dashboard/pet-family-page";
import { prisma } from "../../../lib/prisma";
import { getCurrentSession } from "../../../lib/session";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

const UPCOMING_STATUSES = [
  "pending",
  "confirmed",
  "upcoming",
];

export default async function OwnerPetsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "pet_owner") {
    redirect("/");
  }

  const userId = BigInt(session.sub);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const owner = await prisma.pet_owner.findUnique({
    where: {
      user_id: userId,
    },
    select: {
      booking: {
        where: {
          start_date: {
            gte: today,
          },
        },
        orderBy: {
          start_date: "asc",
        },
        select: {
          status: true,
          start_date: true,
        },
      },
    },
  });

  const upcomingBookings = (
    owner?.booking ?? []
  ).filter((booking) =>
    UPCOMING_STATUSES.includes(
      booking.status.toLowerCase()
    )
  );

  return (
    <PetFamilyPage
      upcomingBookingCount={upcomingBookings.length}
      nextBookingDate={
        upcomingBookings[0]?.start_date?.toISOString() ??
        null
      }
    />
  );
}
