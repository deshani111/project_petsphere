"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import BookingSummary from "../components/booking-summary";
import { useBooking } from "../components/booking-context";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function displayDate(date: Date) {
  return `${monthNames[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

export default function BookingDatesPage() {
  const { draft, setDraft } = useBooking();

  const today = new Date();

  const [month, setMonth] = useState(
    new Date((draft.startDate ?? today).getFullYear(), (draft.startDate ?? today).getMonth(), 1)
  );

  const startDate = draft.startDate;
  const endDate = draft.endDate;
  const dropOff = draft.dropOff ?? "09:00 AM";
  const pickUp = draft.pickUp ?? "05:00 PM";

  const firstWeekday = (month.getDay() + 6) % 7;

  const totalDays = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();

  const calendarDays = Array.from(
    { length: firstWeekday + totalDays },
    (_, index) =>
      index < firstWeekday
        ? null
        : new Date(
            month.getFullYear(),
            month.getMonth(),
            index - firstWeekday + 1
          )
  );

  const selectedLabel = startDate
    ? `${displayDate(startDate)}${
        endDate ? ` - ${displayDate(endDate)}` : ""
      }`
    : "Select dates";

  const nightCount =
    startDate && endDate
      ? Math.max(
          1,
          Math.round(
            (endDate.getTime() - startDate.getTime()) / 86400000
          )
        )
      : 0;

  function selectDate(date: Date) {
    if (!startDate || endDate) {
      setDraft({ startDate: date, endDate: null });
      return;
    }

    if (date.getTime() < startDate.getTime()) {
      setDraft({ startDate: date, endDate: null });
      return;
    }

    setDraft({ endDate: date });
  }

  function inRange(date: Date) {
    return Boolean(
      startDate &&
        endDate &&
        date.getTime() >= startDate.getTime() &&
        date.getTime() <= endDate.getTime()
    );
  }

  return (
    <div className="booking-content-grid">
      <section className="min-w-0">
        <h1 className="m-0 text-[21px] font-bold tracking-[-.8px]">
          When do you need care?
        </h1>

        <p className="mb-5 mt-2 text-[13px] text-[#7c7071]">
          Select the dates and times for your companion&apos;s boarding
          experience.
        </p>

        <div className="rounded-[16px] border border-[#e9cfcd] bg-white p-4 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <strong className="text-[16px]">
                {monthNames[month.getMonth()]} {month.getFullYear()}
              </strong>

              <button
                type="button"
                onClick={() =>
                  setMonth(
                    new Date(
                      month.getFullYear(),
                      month.getMonth() - 1,
                      1
                    )
                  )
                }
                aria-label="Previous month"
                className="grid h-8 w-8 place-items-center rounded-full border border-[#ead5d3] text-[11px] text-[#A13D3F]"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() =>
                  setMonth(
                    new Date(
                      month.getFullYear(),
                      month.getMonth() + 1,
                      1
                    )
                  )
                }
                aria-label="Next month"
                className="grid h-8 w-8 place-items-center rounded-full border border-[#ead5d3] text-[11px] text-[#A13D3F]"
              >
                ›
              </button>
            </div>

            <span className="rounded-full border border-[#f5dedb] bg-[#fff0ef] px-2.5 py-1 text-[10px] font-medium text-[#A13D3F]">
              <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#A13D3F]" />
              Selected Range
            </span>
          </div>

          <div className="grid grid-cols-7 text-center">
            {weekdays.map((day) => (
              <span
                key={day}
                className="mb-3 text-[11px] font-medium uppercase tracking-[.4px] text-[#a39798]"
              >
                {day}
              </span>
            ))}

            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <span
                    key={`empty-${index}`}
                    className="h-12 sm:h-16"
                  />
                );
              }

              const key = dateKey(date);
              const isStart = Boolean(
                startDate && key === dateKey(startDate)
              );
              const isEnd = Boolean(
                endDate && key === dateKey(endDate)
              );
              const selected = isStart || isEnd;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectDate(date)}
                  aria-pressed={selected}
                  aria-label={`${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`}
                  className={`relative my-1 h-10 text-[13px] sm:my-2 sm:h-12 ${
                    inRange(date) ? "bg-[#fce4e1]" : ""
                  } ${isStart || index % 7 === 0 ? "rounded-l-full" : ""} ${
                    isEnd || index % 7 === 6 ? "rounded-r-full" : ""
                  }`}
                >
                  <span
                    className={`relative z-10 inline-grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full ${
                      selected
                        ? "bg-[#A13D3F] font-bold text-white shadow-[0_3px_6px_rgba(161,61,63,.2)]"
                        : "hover:bg-[#fff0ef]"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4 border-t border-[#efdcda] pt-5 sm:grid-cols-2">
            <label className="text-[12px] text-[#776b6c]">
              Estimated Drop-off

              <span className="relative mt-2 block">
                <Clock3 size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#b74b4e]" />
              <select
                value={dropOff}
                onChange={(event) =>
                  setDraft({ dropOff: event.target.value })
                }
                className="block h-10 w-full rounded-[8px] border border-[#e6cfcd] bg-[#fff4f2] pl-9 pr-2 text-[12px] text-[#493d3e] outline-none focus:border-[#A13D3F] focus:ring-1 focus:ring-[#A13D3F]"
              >
                <option>09:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
              </select>
              </span>
            </label>

            <label className="text-[12px] text-[#776b6c]">
              Estimated Pick-up

              <span className="relative mt-2 block">
                <Clock3 size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#b74b4e]" />
              <select
                value={pickUp}
                onChange={(event) =>
                  setDraft({ pickUp: event.target.value })
                }
                className="block h-10 w-full rounded-[8px] border border-[#e6cfcd] bg-[#fff4f2] pl-9 pr-2 text-[12px] text-[#493d3e] outline-none focus:border-[#A13D3F] focus:ring-1 focus:ring-[#A13D3F]"
              >
                <option>04:00 PM</option>
                <option>05:00 PM</option>
                <option>06:00 PM</option>
              </select>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between px-1">
          <Link
            href="/owner/bookings"
            className="text-[13px] text-[#A13D3F]"
          >
            Cancel
          </Link>

          <div className="flex gap-3">
            <Link
              href="/owner/bookings/new/pet"
              className="rounded-[9px] border border-[#DCC0BF] px-5 py-3 text-[13px] text-[#A13D3F]"
            >
              ← Previous
            </Link>

            {startDate && endDate ? (
              <Link
                href="/owner/bookings/new/instructions"
                className="rounded-[9px] bg-[#A13D3F] px-6 py-3 text-[13px] font-bold text-white shadow-[0_5px_10px_rgba(161,61,63,.17)]"
              >
                Next →
              </Link>
            ) : (
              <span className="rounded-[9px] bg-[#e8c9c6] px-6 py-3 text-[13px] text-white">
                Select a date
              </span>
            )}
          </div>
        </div>
      </section>

      <BookingSummary
        service="Boarding"
        price="8,500.00"
        unit="/ night"
        dateLabel={selectedLabel}
        nightsLabel={
          nightCount
            ? `${nightCount} Night${nightCount === 1 ? "" : "s"} Total`
            : "Choose an end date"
        }
      />
    </div>
  );
}