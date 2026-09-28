export type BookingDraft = {
  service?: string;
  petId?: string;
  startDate?: string;
  endDate?: string;
};

const KEY = "petsphere_booking_draft";

export function readBookingDraft(): BookingDraft {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as BookingDraft;
  } catch {
    return {};
  }
}

export function updateBookingDraft(update: Partial<BookingDraft>) {
  const next = { ...readBookingDraft(), ...update };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearBookingDraft() {
  window.localStorage.removeItem(KEY);
}
