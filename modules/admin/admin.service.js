import { prisma } from "../../lib/prisma";
import { authorizeAdmin } from "../../lib/authorization";

function toAdminAccount(session) {
  return {
    id: session.sub,
    firstName: session.firstName,
    lastName: session.lastName,
    fullName: session.fullName,
    email: session.email,
    role: session.role,
    isVerified: session.isVerified,
    hasAdminProfile: session.hasAdminProfile,
  };
}

export async function resolveCurrentAdmin() {
  const authorization = await authorizeAdmin();
  return {
    status: authorization.status,
    account: authorization.session ? toAdminAccount(authorization.session) : null,
  };
}

export async function getCurrentAdmin() {
  const resolved = await resolveCurrentAdmin();
  return resolved.account;
}

export async function getAdminDashboardData() {
  const [totalPetOwners, totalPetSitters, pendingSitterVerifications, activeBookings, recentUsers, payments, services, recentBookings, pendingSitters] =
    await Promise.all([
      prisma.users.count({ where: { role: "pet_owner" } }),
      prisma.users.count({ where: { role: "pet_sitter" } }),
      prisma.pet_sitter.count({ where: { is_verified: false } }),
      prisma.booking.count({ where: { status: { in: ["pending", "confirmed", "in_progress"] } } }),
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
          _count: { select: { booking: true } },
        },
      }),
    ]);

  return {
    totalPetOwners,
    totalPetSitters,
    pendingSitterVerifications,
    activeBookings,
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
      bookings: service._count.booking,
    })),
  };
}
