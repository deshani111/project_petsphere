"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type BookingRow = {
  id: string;
  sitter: string;
  pet: string;
  service: string;
  dates: string;
  status: string;
  amount: string;
};

const filters = ["All", "Upcoming", "In Progress", "Completed", "Cancelled"];

export function BookingTable({ bookings }: { bookings: BookingRow[] }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const filteredBookings = useMemo(
    () =>
      activeFilter === "All"
        ? bookings
        : bookings.filter((booking) => booking.status.toLowerCase() === activeFilter.toLowerCase()),
    [activeFilter, bookings],
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2" aria-label="Booking filters">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeFilter === filter
                ? "bg-[#ab3d42] text-white"
                : "border border-[#ead7d5] bg-white text-[#705e60] hover:bg-[#fff4f2]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#efdddd] bg-white">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-[#fff5f4] text-xs uppercase tracking-wider text-[#705e60]">
            <tr><th className="px-4 py-3">Sitter</th><th className="px-4 py-3">Pet</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-[#f3e9e7]">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="transition hover:bg-[#fffafa]">
                <td className="px-4 py-4 font-medium"><Link href={`/owner/bookings/${booking.id}`} className="block hover:text-[#ab3d42]">{booking.sitter}</Link></td>
                <td className="px-4 py-4"><Link href={`/owner/bookings/${booking.id}`} className="block">{booking.pet}</Link></td>
                <td className="px-4 py-4"><Link href={`/owner/bookings/${booking.id}`} className="block">{booking.service}</Link></td>
                <td className="px-4 py-4"><Link href={`/owner/bookings/${booking.id}`} className="block">{booking.dates}</Link></td>
                <td className="px-4 py-4"><Link href={`/owner/bookings/${booking.id}`} className="block"><span className="rounded-full bg-[#fff0ef] px-3 py-1 text-xs font-semibold text-[#ab3d42]">{booking.status}</span></Link></td>
                <td className="px-4 py-4 text-right font-semibold"><Link href={`/owner/bookings/${booking.id}`} className="block">{booking.amount}</Link></td>
              </tr>
            ))}
            {filteredBookings.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-[#887c7d]">No {activeFilter.toLowerCase()} bookings found.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
