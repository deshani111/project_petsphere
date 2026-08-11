"use client";

import { useState } from "react";
import Link from "next/link";
import BookingSummary from "../components/booking-summary";

const fields = [
  { id: "behaviour", icon: "♧", title: "Behavioral Notes & Temperament", hint: "Does your pet have any fears? How do they react to other dogs or strangers?" },
  { id: "health", icon: "♧", title: "Health, Allergies & Medication", hint: "List any allergies, dietary restrictions, or medication schedules." },
  { id: "emergency", icon: "✱", title: "Emergency Contact Info", hint: "Who should we call if you're unreachable? Include veterinarian details." },
];

export default function BookingInstructionsPage() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const hasNotes = Object.values(notes).some(Boolean);

  return (
    <div className="mx-auto mt-2.5 grid max-w-[747px] grid-cols-1 gap-[15px] px-[14px] pb-6 sm:px-[18px] md:grid-cols-[minmax(420px,1fr)_170px]">
      <section className="rounded-[14px] bg-white p-4 sm:p-5">
        <h1 className="m-0 text-[17px] font-bold tracking-[-.6px]">Anything else the sitter should know?</h1>
        <p className="mb-3 mt-1.5 max-w-[375px] text-[8px] leading-[1.45] text-[#7c7071]">Provide behavioral notes, allergies, or emergency contact information to ensure the best care for your pet.</p>
        <div className="grid gap-3">
          {fields.map((field) => <label key={field.id} className="block rounded-[10px] border border-[#ead1cf] p-3 transition focus-within:border-[#A13D3F] focus-within:ring-1 focus-within:ring-[#f5d8d5]"><span className="flex items-center gap-1 text-[8px] font-bold text-[#413637]"><i className="text-[11px] not-italic text-[#A13D3F]">{field.icon}</i>{field.title}</span><textarea value={notes[field.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [field.id]: event.target.value }))} placeholder={field.hint} rows={2} className="mt-1.5 block w-full resize-none border-0 bg-transparent p-0 text-[8px] leading-[1.45] text-[#5f5354] outline-none placeholder:text-[#918485]" /></label>)}
        </div>
        <div className="mt-5 flex items-center justify-between px-1"><Link href="/owner/bookings" className="text-[9px] text-[#A13D3F]">Cancel</Link><div className="flex gap-3"><Link href="/owner/bookings/new/dates" className="rounded-[8px] border border-[#DCC0BF] px-3 py-[8px] text-[9px] text-[#A13D3F]">← Previous</Link><button type="button" disabled={!hasNotes} className="rounded-[8px] bg-[#A13D3F] px-3 py-[8px] text-[9px] text-white shadow-[0_5px_10px_rgba(161,61,63,.17)] disabled:cursor-not-allowed disabled:bg-[#f8d8d1] disabled:shadow-none">Confirm Booking</button></div></div>
      </section>
      <BookingSummary service="Boarding" price="8,500.00" unit="/ night" />
    </div>
  );
}
