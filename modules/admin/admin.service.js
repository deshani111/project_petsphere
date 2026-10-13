import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";
import {
  getSessionAccount,
  isAdminRole,
  SESSION_COOKIE_NAME,
} from "../auth/auth.service";

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const account = await getSessionAccount(sessionToken);

  return account && isAdminRole(account.role) && account.hasAdminProfile && account.isVerified
    ? account
    : null;
}

export async function getAdminDashboardData() {
  const [totalPetOwners, totalPetSitters, pendingSitterVerifications, totalBookings, recentUsers, payments, services] =
    await Promise.all([
      prisma.users.count({ where: { role: "pet_owner" } }),
      prisma.users.count({ where: { role: "pet_sitter" } }),
      prisma.pet_sitter.count({ where: { is_verified: false } }),
      prisma.booking.count(),
      prisma.users.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          email: true,
          role: true,
          created_at: true,
        },
      }),
      prisma.payment.findMany({
        where: { status: "completed" },
        select: { amount: true, payment_date: true },
        orderBy: { payment_date: "asc" },
      }),
      prisma.service_type.findMany({
        select: {
          name: true,
          booking: { select: { booking_id: true } },
        },
      }),
    ]);

  return {
    totalPetOwners,
    totalPetSitters,
    pendingSitterVerifications,
    totalBookings,
    recentUsers: recentUsers.map((user) => ({
      id: user.user_id.toString(),
      fullName: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      role: user.role,
      createdAt: user.created_at.toISOString(),
    })),
    revenue: payments.map((payment) => ({
      amount: Number(payment.amount),
      date: payment.payment_date.toISOString(),
    })),
    bookingsByService: services.map((service) => ({
      name: service.name,
      bookings: service.booking.length,
    })),
  };
}
