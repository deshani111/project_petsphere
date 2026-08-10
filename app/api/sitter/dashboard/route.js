import { NextResponse } from "next/server";
import { getCurrentSitter, getSitterBookings } from "../../../../modules/sitter/sitter.service";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const sitter = await getCurrentSitter();
  if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
  const bookings = await getSitterBookings(sitter);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const completed = bookings.filter((b) => b.status === "completed");
  const monthEarnings = completed.filter((b) => b.endDate && new Date(b.endDate) >= monthStart).reduce((sum, b) => sum + b.amount, 0);
  const unreadMessages = await prisma.message.count({ where: { receiver_id: sitter.user_id, is_read: false } });
  const reviews = await prisma.review.aggregate({ where: { sitter_id: sitter.sitter_id }, _avg: { rating: true }, _count: { _all: true } });
  const activeServices = await prisma.pet_sitter_service.count({ where: { sitter_id: sitter.sitter_id, is_active: true } });
  return NextResponse.json({
    sitter: { name: `${sitter.users.first_name} ${sitter.users.last_name}`.trim(), verified: sitter.is_verified },
    stats: { totalBookings: bookings.length, pending: bookings.filter((b) => b.status === "pending").length, upcoming: bookings.filter((b) => ["confirmed", "in_progress"].includes(b.status) && (!b.startDate || new Date(b.startDate) >= new Date(now.toDateString()))).length, completed: completed.length, cancelled: bookings.filter((b) => ["cancelled", "rejected"].includes(b.status)).length, totalEarnings: completed.reduce((sum, b) => sum + b.amount, 0), monthEarnings, averageRating: Number(reviews._avg.rating ?? 0), reviewCount: reviews._count._all, activeServices, unreadMessages },
    pending: bookings.filter((b) => b.status === "pending").slice(0, 2), upcomingBookings: bookings.filter((b) => b.status === "confirmed").slice(0, 5),
  });
}
