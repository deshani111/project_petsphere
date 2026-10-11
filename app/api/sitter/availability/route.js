import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentSitter, serialize } from "../../../../modules/sitter/sitter.service";

const validTime = (value) => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export async function GET() {
  const sitter = await getCurrentSitter();
  if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
  const [days, blockedDates] = await Promise.all([prisma.sitter_availability.findMany({ where: { sitter_id: sitter.sitter_id }, orderBy: { weekday: "asc" } }), prisma.sitter_unavailable_date.findMany({ where: { sitter_id: sitter.sitter_id }, orderBy: { unavailable_date: "asc" } })]);
  return NextResponse.json({ days: serialize(days), blockedDates: serialize(blockedDates) });
}
export async function PUT(request) {
  const sitter = await getCurrentSitter();
  if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.days) || body.days.length !== 7) return NextResponse.json({ message: "Availability must include all seven days." }, { status: 400 });
  for (const day of body.days) if (!Number.isInteger(day.weekday) || day.weekday < 0 || day.weekday > 6 || typeof day.isAvailable !== "boolean" || !validTime(day.startTime) || !validTime(day.endTime) || day.startTime >= day.endTime) return NextResponse.json({ message: "Please provide valid availability times." }, { status: 400 });
  await prisma.$transaction(async (tx) => { for (const day of body.days) await tx.sitter_availability.upsert({ where: { sitter_id_weekday: { sitter_id: sitter.sitter_id, weekday: day.weekday } }, update: { is_available: day.isAvailable, start_time: day.startTime, end_time: day.endTime }, create: { sitter_id: sitter.sitter_id, weekday: day.weekday, is_available: day.isAvailable, start_time: day.startTime, end_time: day.endTime } }); });
  return NextResponse.json({ message: "Availability saved." });
}
