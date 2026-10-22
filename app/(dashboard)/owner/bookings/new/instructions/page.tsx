"use client";

import Link from "next/link";
import BookingSummary from "../components/booking-summary";
import { useBooking } from "../components/booking-context";

const fields = [
  {
    id: "behaviour",
    icon: "♧",
    title: "Behavioral Notes & Temperament",
    hint: "Does your pet have any fears? How do they react to other dogs or strangers?",
  },
  {
    id: "health",
    icon: "♧",
    title: "Health, Allergies & Medication",
    hint: "List any allergies, dietary restrictions, or medication schedules.",
  },
  {
    id: "emergency",
    icon: "✱",
    title: "Emergency Contact Info",
    hint: "Who should we call if you're unreachable? Include veterinarian details.",
  },
];

export default function BookingInstructionsPage() {
  const { draft, setDraft } = useBooking();
  const notes = draft.notes;

  return (
    <div className="booking-content-grid">
      <section className="min-w-0 self-start rounded-[16px] bg-white p-5 sm:p-7">
        <h1 className="m-0 text-[21px] font-bold tracking-[-.6px] sm:text-[24px]">
          Anything else the sitter should know?
        </h1>

        <p className="mb-6 mt-2 max-w-[600px] text-[13px] leading-relaxed text-[#7c7071]">
          Provide behavioral notes, allergies, or emergency contact
          information to ensure the best care for your pet.
        </p>

        <div className="grid gap-4">
          {fields.map((field) => (
            <label
              key={field.id}
              className="block rounded-[10px] border border-[#ead1cf] p-4 sm:p-5 transition focus-within:border-[#A13D3F] focus-within:ring-1 focus-within:ring-[#f5d8d5]"
            >
              <span className="flex items-center gap-2 text-[13px] font-bold text-[#413637]">
                <i className="text-[15px] not-italic text-[#A13D3F]">
                  {field.icon}
                </i>
                {field.title}
              </span>

              <textarea
                value={notes[field.id] ?? ""}
                onChange={(event) =>
                  setDraft({
                    notes: {
                      ...notes,
                      [field.id]: event.target.value,
                    },
                  })
                }
                placeholder={field.hint}
                rows={3}
                className="mt-2 block min-h-[80px] w-full resize-y border-0 bg-transparent p-0 text-[13px] leading-relaxed text-[#5f5354] outline-none placeholder:text-[#918485]"
              />
            </label>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/owner/bookings"
            className="text-[13px] text-[#A13D3F]"
          >
            Cancel
          </Link>

          <div className="flex gap-3">
            <Link
              href="/owner/bookings/new/dates"
              className="rounded-[7px] border border-[#DCC0BF] px-4 py-2.5 text-[13px] text-[#A13D3F]"
            >
              ← Previous
            </Link>

            <Link
              href="/owner/bookings/requested"
              className="rounded-[7px] bg-[#A13D3F] px-4 py-2.5 text-[13px] text-white shadow-[0_5px_10px_rgba(161,61,63,.17)]"
            >
              Confirm Booking
            </Link>
          </div>
        </div>
      </section>

      <BookingSummary
        service="Boarding"
        price="8,500.00"
        unit="/ night"
      />
    </div>
  );
}