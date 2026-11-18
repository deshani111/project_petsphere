"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ServiceId = "boarding" | "walking" | "grooming" | "training";

export interface BookingDraft {
  service: ServiceId | null;
  pet: string | null;
  startDate: Date | null;
  endDate: Date | null;
  dropOff: string;
  pickUp: string;
  notes: Record<string, string>;
}

const initialDraft: BookingDraft = { service: "boarding", pet: "charlie", startDate: new Date(2024, 8, 11), endDate: new Date(2024, 8, 15), dropOff: "09:00 AM", pickUp: "05:00 PM", notes: {} };
const BookingContext = createContext<{ draft: BookingDraft; setDraft: (value: Partial<BookingDraft>) => void } | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState(initialDraft);
  const value = useMemo(() => ({ draft, setDraft: (value: Partial<BookingDraft>) => setDraftState((current) => ({ ...current, ...value })) }), [draft]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used inside BookingProvider");
  return context;
}
