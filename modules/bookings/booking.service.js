import { prisma } from "../../lib/prisma";

export const BOOKING_STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled", "rejected"];

export const BOOKING_TRANSITIONS = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  rejected: [],
  cancelled: [],
};

const PRICES = {
  boarding: 8500,
  walking: 4000,
  grooming: 6000,
  training: 5000,
};

const bookingInclude = {
  pet: true,
  pet_owner: { include: { users: { select: { first_name: true, last_name: true, phone_number: true } } } },
  service_type: true,
};

function parseId(value) {
  return typeof value === "string" && /^\d+$/.test(value) ? BigInt(value) : null;
}

function parseDate(value) {
  if (typeof value !== "string" || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isValidBookingStatus(value) {
  return typeof value === "string" && BOOKING_STATUSES.includes(value);
}

export function formatBooking(booking) {
  return {
    id: booking.booking_id.toString(),
    status: booking.status,
    startDate: booking.start_date?.toISOString() ?? null,
    endDate: booking.end_date?.toISOString() ?? null,
    amount: Number(booking.total_amount ?? 0),
    notes: booking.notes ?? "",
    createdAt: booking.created_at.toISOString(),
    pet: {
      name: booking.pet.pet_name,
      species: booking.pet.species,
      breed: booking.pet.breed,
      photo: booking.pet.photo,
    },
    owner: {
      name: `${booking.pet_owner.users.first_name} ${booking.pet_owner.users.last_name}`.trim(),
      phone: booking.pet_owner.users.phone_number,
    },
    service: booking.service_type?.name ?? "Pet care",
  };
}

export async function listOwnerBookings(ownerId) {
  return prisma.booking.findMany({
    where: { owner_id: ownerId },
    orderBy: { booking_date: "desc" },
    select: {
      booking_id: true,
      status: true,
      start_date: true,
      end_date: true,
      total_amount: true,
      pet: { select: { pet_name: true } },
      service_type: { select: { name: true } },
      pet_sitter: { select: { users: { select: { first_name: true, last_name: true } } } },
    },
  });
}

export async function createOwnerBooking(ownerId, input) {
  const service = typeof input.service === "string" ? input.service.toLowerCase() : "";
  const petId = parseId(input.petId);
  const startDate = parseDate(input.startDate);
  const endDate = input.endDate ? parseDate(input.endDate) : null;
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";

  if (!petId || !PRICES[service] || !startDate) {
    return { error: "Please complete the service, pet, and date steps.", status: 400 };
  }
  if (input.endDate && !endDate) {
    return { error: "Please select a valid date range.", status: 400 };
  }
  if (endDate && endDate < startDate) {
    return { error: "Please select a valid date range.", status: 400 };
  }

  const [pet, serviceType] = await Promise.all([
    prisma.pet.findFirst({
      where: { pet_id: petId, owner_id: ownerId },
      select: { pet_id: true },
    }),
    prisma.service_type.findFirst({
      where: { name: { equals: service, mode: "insensitive" } },
      select: { service_type_id: true },
    }),
  ]);

  if (!pet) {
    return { error: "The selected pet does not belong to this account.", status: 403 };
  }
  if (!serviceType) {
    return { error: "The selected service is not available.", status: 400 };
  }

  const days = endDate
    ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000))
    : 1;

  const booking = await prisma.booking.create({
    data: {
      owner_id: ownerId,
      pet_id: petId,
      service_type_id: serviceType.service_type_id,
      start_date: startDate,
      end_date: endDate,
      notes: notes || null,
      status: "pending",
      total_amount: PRICES[service] * (service === "boarding" ? days : 1),
    },
    select: { booking_id: true },
  });

  return { bookingId: booking.booking_id.toString() };
}

export async function listSitterBookings(sitterId, where = {}) {
  const rows = await prisma.booking.findMany({
    where: { sitter_id: sitterId, ...where },
    orderBy: { start_date: "asc" },
    include: {
      pet: { select: { pet_name: true, species: true, breed: true, photo: true } },
      pet_owner: { select: { users: { select: { first_name: true, last_name: true, phone_number: true } } } },
      service_type: { select: { name: true } },
    },
  });
  return rows.map(formatBooking);
}

async function validateSitterAvailability(tx, sitterId, startDate, endDate, serviceTypeId) {
  if (!startDate) return null;
  const lastDate = endDate ?? startDate;
  const dates = [];
  for (const date = new Date(startDate); date <= lastDate; date.setUTCDate(date.getUTCDate() + 1)) {
    dates.push(new Date(date));
  }

  const [sitter, activeService, availability, unavailableDates, overrides] = await Promise.all([
    tx.pet_sitter.findUnique({ where: { sitter_id: sitterId }, select: { is_available: true } }),
    serviceTypeId
      ? tx.pet_sitter_service.findUnique({
          where: {
            sitter_id_service_type_id: {
              sitter_id: sitterId,
              service_type_id: serviceTypeId,
            },
          },
          include: { service_type: true },
        })
      : Promise.resolve(null),
    serviceTypeId
      ? tx.sitter_service_schedule.findMany({
          where: { sitter_id: sitterId, service_type_id: serviceTypeId },
        })
      : tx.sitter_availability.findMany({ where: { sitter_id: sitterId } }),
    tx.sitter_unavailable_date.findMany({
      where: { sitter_id: sitterId, unavailable_date: { in: dates } },
      select: { unavailable_date: true },
    }),
    serviceTypeId
      ? tx.sitter_service_date_override.findMany({
          where: {
            sitter_id: sitterId,
            service_type_id: serviceTypeId,
            unavailable_date: { in: dates },
          },
        })
      : Promise.resolve([]),
  ]);

  if (!sitter?.is_available) return "This sitter is not currently available.";
  if (serviceTypeId && !activeService?.is_active) return "This service is no longer active.";
  if (!serviceTypeId && unavailableDates.length) return "The sitter is unavailable for the selected dates.";

  const overrideByDate = new Map(
    overrides.map((override) => [override.unavailable_date.toISOString().slice(0, 10), override]),
  );
  const availabilityByDay = new Map(
    availability.map((day) => [day.weekday, day]),
  );
  for (const date of dates) {
    const dateKey = date.toISOString().slice(0, 10);
    const override = overrideByDate.get(dateKey);
    if (override) {
      if (!override.is_available) {
        return "The sitter is unavailable for one or more selected dates.";
      }
      continue;
    }
    const weekday = date.getUTCDay();
    if (serviceTypeId && availability.length) {
      if (!availabilityByDay.get(weekday)?.is_available) {
        return "The sitter is unavailable for one or more selected dates.";
      }
    } else if (!serviceTypeId && availability.length) {
      if (!availabilityByDay.get(weekday)?.is_available) {
        return "The sitter is unavailable for one or more selected dates.";
      }
    }
  }
  return null;
}

async function assertNoConflictingBooking(tx, booking) {
  if (!booking.start_date || !booking.sitter_id) return null;
  const isBoarding = /boarding/i.test(booking.service_type?.name || "");
  if (isBoarding) {
    const capacity = await tx.sitter_boarding_capacity.findUnique({
      where: {
        sitter_id_service_type_id: {
          sitter_id: booking.sitter_id,
          service_type_id: booking.service_type_id,
        },
      },
    });
    if (capacity) {
      const endDate = booking.end_date ?? new Date(booking.start_date.getTime() + 86_400_000);
      for (
        let date = new Date(booking.start_date);
        date < endDate;
        date.setUTCDate(date.getUTCDate() + 1)
      ) {
        const occupied = await tx.booking.count({
          where: {
            booking_id: { not: booking.booking_id },
            sitter_id: booking.sitter_id,
            service_type_id: booking.service_type_id,
            status: { in: ["confirmed", "in_progress"] },
            start_date: { lt: new Date(date.getTime() + 86_400_000) },
            OR: [
              { end_date: null, start_date: { lte: date } },
              { end_date: { gt: date } },
            ],
          },
        });
        if (occupied >= capacity.max_capacity) {
          return "The boarding capacity is full for one or more selected dates.";
        }
      }
    }
    return null;
  }
  const conflict = await tx.booking.findFirst({
    where: {
      booking_id: { not: booking.booking_id },
      sitter_id: booking.sitter_id,
      status: { in: ["confirmed", "in_progress"] },
      start_date: { lt: booking.end_date ?? new Date(booking.start_date.getTime() + 86_400_000) },
      OR: [
        { end_date: null },
        { end_date: { gt: booking.start_date } },
      ],
    },
    select: { booking_id: true },
  });
  return conflict ? "The sitter already has a booking during the selected dates." : null;
}

export async function getSitterBooking(sitterId, bookingId) {
  const id = parseId(bookingId);
  if (!id) return null;
  return prisma.booking.findFirst({
    where: { booking_id: id, sitter_id: sitterId },
    include: bookingInclude,
  });
}

export async function updateSitterBookingStatus(sitterId, bookingId, nextStatus) {
  const id = parseId(bookingId);
  if (!id) return { error: "Booking not found.", status: 404 };
  if (!isValidBookingStatus(nextStatus)) return { error: "Invalid booking status.", status: 400 };

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.booking.findFirst({
      where: { booking_id: id, sitter_id: sitterId },
      include: { pet: true, pet_owner: { include: { users: { select: { first_name: true, last_name: true, phone_number: true } } } }, service_type: true },
    }, { isolationLevel: "Serializable" });
    if (!existing) return { error: "Booking not found.", status: 404 };
    if (!BOOKING_TRANSITIONS[existing.status]?.includes(nextStatus)) {
      return { error: "That booking status change is not allowed.", status: 409 };
    }

    if (nextStatus === "confirmed") {
      const todayUtc = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
      if (existing.start_date && existing.start_date.getTime() < todayUtc) {
        return { error: "This booking request has expired because its start date has passed.", status: 409 };
      }
      const availabilityError = await validateSitterAvailability(
        tx,
        sitterId,
        existing.start_date,
        existing.end_date,
        existing.service_type_id,
      );
      if (availabilityError) return { error: availabilityError, status: 409 };
      const conflictError = await assertNoConflictingBooking(tx, existing);
      if (conflictError) return { error: conflictError, status: 409 };
    }

    const booking = await tx.booking.update({
      where: { booking_id: id },
      data: { status: nextStatus },
      include: bookingInclude,
    });
    await tx.notification.create({
      data: {
        user_id: existing.owner_id,
        type: "booking_status",
        message: `Your booking has been ${nextStatus}.`,
      },
    });
    return { booking: formatBooking(booking) };
  });

  return result;
}
