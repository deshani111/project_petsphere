import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentSitter, serialize } from "../../../../modules/sitter/sitter.service";

const validTime = (value) =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

function minutes(value) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateSlots(slots) {
  if (!Array.isArray(slots) || !slots.length) return false;
  const sorted = slots
    .map((slot) => ({ startTime: slot.startTime, endTime: slot.endTime }))
    .filter((slot) => validTime(slot.startTime) && validTime(slot.endTime))
    .sort((a, b) => minutes(a.startTime) - minutes(b.startTime));
  if (sorted.length !== slots.length) return false;
  for (let index = 0; index < sorted.length; index += 1) {
    if (minutes(sorted[index].endTime) <= minutes(sorted[index].startTime)) return false;
    if (index > 0 && minutes(sorted[index].startTime) < minutes(sorted[index - 1].endTime)) {
      return false;
    }
  }
  return true;
}

export async function GET() {
  const sitter = await getCurrentSitter();
  if (!sitter) {
    return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
  }

  const activeRows = await prisma.pet_sitter_service.findMany({
    where: { sitter_id: sitter.sitter_id, is_active: true },
    include: { service_type: true },
    orderBy: { service_type_id: "asc" },
  });

  const services = activeRows.map((row) => ({
    id: row.service_type_id.toString(),
    name: row.service_type.name,
    description: row.service_type.description || "",
    price: Number(row.price),
  }));

  if (!services.length) {
    return NextResponse.json({
      services,
      legacyDays: [],
      blockedDates: [],
      schedules: {},
      overrides: {},
      boardingCapacity: {},
      confirmedBookings: [],
    });
  }

  const serviceIds = activeRows.map((row) => row.service_type_id);
  const [legacyDays, schedules, overrides, capacities, blockedDates, confirmedBookings] =
    await Promise.all([
      prisma.sitter_availability.findMany({
        where: { sitter_id: sitter.sitter_id },
        orderBy: { weekday: "asc" },
      }),
      prisma.sitter_service_schedule.findMany({
        where: { sitter_id: sitter.sitter_id, service_type_id: { in: serviceIds } },
        include: { time_slots: true },
        orderBy: [{ service_type_id: "asc" }, { weekday: "asc" }],
      }),
      prisma.sitter_service_date_override.findMany({
        where: { sitter_id: sitter.sitter_id, service_type_id: { in: serviceIds } },
        include: { time_slots: true },
        orderBy: [{ service_type_id: "asc" }, { unavailable_date: "asc" }],
      }),
      prisma.sitter_boarding_capacity.findMany({
        where: { sitter_id: sitter.sitter_id, service_type_id: { in: serviceIds } },
      }),
      prisma.sitter_unavailable_date.findMany({
        where: { sitter_id: sitter.sitter_id },
        orderBy: { unavailable_date: "asc" },
      }),
      prisma.booking.findMany({
        where: {
          sitter_id: sitter.sitter_id,
          status: { in: ["confirmed", "in_progress"] },
          service_type_id: { in: serviceIds },
        },
        select: {
          start_date: true,
          end_date: true,
          status: true,
          service_type_id: true,
          service_type: { select: { name: true } },
        },
      }),
    ]);

  const scheduleMap = {};
  activeRows.forEach((row) => {
    const id = row.service_type_id.toString();
    scheduleMap[id] = Array.from({ length: 7 }, (_, weekday) => {
      const legacy = legacyDays.find((day) => day.weekday === weekday);
      const saved = schedules.find(
        (day) => day.service_type_id === row.service_type_id && day.weekday === weekday,
      );
      const savedSlots = saved?.time_slots || [];
      return {
        weekday,
        isAvailable: saved ? saved.is_available : Boolean(legacy?.is_available ?? true),
        slots:
          savedSlots.length
            ? savedSlots.map((slot) => ({
                startTime: slot.start_time,
                endTime: slot.end_time,
              }))
            : [
                {
                  startTime: legacy?.start_time || "09:00",
                  endTime: legacy?.end_time || "17:00",
                },
              ],
      };
    });
  });

  const overrideMap = {};
  for (const override of overrides) {
    const id = override.service_type_id.toString();
    overrideMap[id] ||= [];
    overrideMap[id].push({
      date: override.unavailable_date.toISOString().slice(0, 10),
      isAvailable: override.is_available,
      reason: override.reason || "",
      slots: override.time_slots.map((slot) => ({
        startTime: slot.start_time,
        endTime: slot.end_time,
      })),
    });
  }

  const capacityMap = {};
  for (const capacity of capacities) {
    capacityMap[capacity.service_type_id.toString()] = capacity.max_capacity;
  }

  return NextResponse.json(
    serialize({
      services,
      legacyDays,
      blockedDates: blockedDates.map((row) => ({
        date: row.unavailable_date.toISOString().slice(0, 10),
        reason: row.reason,
      })),
      schedules: scheduleMap,
      overrides: overrideMap,
      boardingCapacity: capacityMap,
      confirmedBookings: confirmedBookings.map((booking) => ({
        serviceId: booking.service_type_id?.toString() || null,
        serviceName: booking.service_type?.name || "",
        startDate: booking.start_date?.toISOString().slice(0, 10) || null,
        endDate: booking.end_date?.toISOString().slice(0, 10) || null,
        status: booking.status,
      })),
    }),
  );
}

export async function PUT(request) {
  const sitter = await getCurrentSitter();
  if (!sitter) {
    return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.serviceId !== "string") {
    return NextResponse.json({ message: "Please select a service." }, { status: 400 });
  }

  let serviceTypeId;
  try {
    serviceTypeId = BigInt(body.serviceId);
  } catch {
    return NextResponse.json({ message: "Invalid service." }, { status: 400 });
  }

  const service = await prisma.pet_sitter_service.findUnique({
    where: {
      sitter_id_service_type_id: {
        sitter_id: sitter.sitter_id,
        service_type_id: serviceTypeId,
      },
    },
    include: { service_type: true },
  });
  if (!service?.is_active) {
    return NextResponse.json({ message: "Only active services can manage availability." }, { status: 403 });
  }

  if (!Array.isArray(body.days) || body.days.length !== 7) {
    return NextResponse.json({ message: "Availability must include all seven days." }, { status: 400 });
  }

  const weekdays = new Set();
  for (const day of body.days) {
    if (
      !day ||
      typeof day !== "object" ||
      !Number.isInteger(day.weekday) ||
      day.weekday < 0 ||
      day.weekday > 6 ||
      typeof day.isAvailable !== "boolean"
    ) {
      return NextResponse.json({ message: "Please provide a valid weekly schedule." }, { status: 400 });
    }
    weekdays.add(day.weekday);
    if (day.isAvailable && !validateSlots(day.slots)) {
      return NextResponse.json({
        message: "Check time slots for valid, non-overlapping end times.",
      }, { status: 400 });
    }
  }
  if (
    weekdays.size !== 7 ||
    ![0, 1, 2, 3, 4, 5, 6].every((weekday) => weekdays.has(weekday))
  ) {
    return NextResponse.json({ message: "Availability must include each weekday once." }, { status: 400 });
  }

  if (body.overrides !== undefined && !Array.isArray(body.overrides)) {
    return NextResponse.json({ message: "Invalid date overrides." }, { status: 400 });
  }

  const overrides = body.overrides || [];
  const seenDates = new Set();
  for (const override of overrides) {
    if (!validDate(override.date) || seenDates.has(override.date)) {
      return NextResponse.json({ message: "Please provide valid date overrides." }, { status: 400 });
    }
    seenDates.add(override.date);
    if (
      typeof override.isAvailable !== "boolean" ||
      (override.isAvailable && !validateSlots(override.slots))
    ) {
      return NextResponse.json({
        message: "Custom date availability must contain valid, non-overlapping time slots.",
      }, { status: 400 });
    }
  }

  const isBoarding = /boarding/i.test(service.service_type.name);
  let boardingCapacity = null;
  if (isBoarding) {
    boardingCapacity = Number(body.boardingCapacity);
    if (!Number.isInteger(boardingCapacity) || boardingCapacity < 1 || boardingCapacity > 100) {
      return NextResponse.json({ message: "Boarding capacity must be between 1 and 100." }, { status: 400 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.sitter_service_time_slot.deleteMany({
      where: { sitter_id: sitter.sitter_id, service_type_id: serviceTypeId },
    });
    await tx.sitter_service_schedule.deleteMany({
      where: { sitter_id: sitter.sitter_id, service_type_id: serviceTypeId },
    });

    for (const day of body.days) {
      await tx.sitter_service_schedule.create({
        data: {
          sitter_id: sitter.sitter_id,
          service_type_id: serviceTypeId,
          weekday: day.weekday,
          is_available: day.isAvailable,
        },
      });
      if (day.isAvailable) {
        await tx.sitter_service_time_slot.createMany({
          data: day.slots.map((slot) => ({
            sitter_id: sitter.sitter_id,
            service_type_id: serviceTypeId,
            weekday: day.weekday,
            start_time: slot.startTime,
            end_time: slot.endTime,
          })),
        });
      }
    }

    const existingOverrides = await tx.sitter_service_date_override.findMany({
      where: { sitter_id: sitter.sitter_id, service_type_id: serviceTypeId },
      select: { override_id: true },
    });
    if (existingOverrides.length) {
      await tx.sitter_service_date_slot.deleteMany({
        where: {
          override_id: {
            in: existingOverrides.map((override) => override.override_id),
          },
        },
      });
    }
    await tx.sitter_service_date_override.deleteMany({
      where: { sitter_id: sitter.sitter_id, service_type_id: serviceTypeId },
    });

    for (const override of overrides) {
      const created = await tx.sitter_service_date_override.create({
        data: {
          sitter_id: sitter.sitter_id,
          service_type_id: serviceTypeId,
          unavailable_date: new Date(`${override.date}T00:00:00.000Z`),
          is_available: override.isAvailable,
          reason: typeof override.reason === "string" ? override.reason.trim().slice(0, 255) : null,
        },
      });
      if (override.isAvailable && override.slots?.length) {
        await tx.sitter_service_date_slot.createMany({
          data: override.slots.map((slot) => ({
            override_id: created.override_id,
            start_time: slot.startTime,
            end_time: slot.endTime,
          })),
        });
      }
    }

    if (isBoarding) {
      await tx.sitter_boarding_capacity.upsert({
        where: {
          sitter_id_service_type_id: {
            sitter_id: sitter.sitter_id,
            service_type_id: serviceTypeId,
          },
        },
        update: { max_capacity: boardingCapacity },
        create: {
          sitter_id: sitter.sitter_id,
          service_type_id: serviceTypeId,
          max_capacity: boardingCapacity,
        },
      });
    }
  });

  return NextResponse.json({ message: "Availability saved successfully." });
}
