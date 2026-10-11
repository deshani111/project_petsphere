"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { bookings, type Booking, type BookingStatus } from "../../../../lib/mock-bookings";
type DateFilter = "All Dates" | "Today" | "This Week" | "This Month";

const navItems = ["Dashboard", "My Pets", "Find a Sitter", "My Bookings", "Messages", "Marketplace", "Blogs", "My Profile"];
const statusFilters: Array<"All" | BookingStatus> = ["All", "Upcoming", "In Progress", "Completed", "Cancelled"];
const pageSize = 7;
const referenceDate = new Date("2024-10-24T00:00:00");

function PawMark() {
  return <span className="grid h-[17px] w-[17px] place-items-center rounded-[5px] bg-[#A13D3F] text-[9px] text-white">♥</span>;
}

function serviceIcon(service: Booking["service"]) {
  return service === "Walking" ? "♘" : service === "Grooming" ? "✂" : service === "Training" ? "⌾" : "▣";
}

function matchesDateFilter(booking: Booking, filter: DateFilter) {
  if (filter === "All Dates") return true;
  const date = new Date(`${booking.date}T00:00:00`);
  const difference = Math.round((date.getTime() - referenceDate.getTime()) / 86400000);
  if (filter === "Today") return difference === 0;
  if (filter === "This Week") return difference >= -3 && difference <= 3;
  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth();
}

export default function OwnerBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All Dates");
  const [page, setPage] = useState(1);

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const matchesStatus = statusFilter === "All" || booking.status === statusFilter;
    return matchesStatus && matchesDateFilter(booking, dateFilter);
  }), [dateFilter, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function changeFilter(value: (typeof statusFilters)[number]) {
    setStatusFilter(value);
    setPage(1);
  }

  function changeDateFilter(value: DateFilter) {
    setDateFilter(value);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-[#fffafa] font-[Inter,Arial,sans-serif] text-[#2d2526] md:flex">
      <aside className="hidden min-h-screen w-[250px] shrink-0 flex-col border-r border-[#efdada] bg-white px-4 pb-6 pt-7 md:flex">
        <Link href="/" className="flex items-start gap-2 px-2 pb-8 text-[21px] font-bold leading-none text-[#A13D3F]"><PawMark /><span>Pet<span>Sphere</span><small className="mt-2 block text-[7px] font-medium tracking-[.55px] text-[#594d4e]">PET CARE PLATFORM</small></span></Link>
        <nav className="grid gap-2" aria-label="Owner navigation">{navItems.map((item) => <Link key={item} href={item === "Find a Sitter" ? "/owner/bookings/new" : item === "My Bookings" ? "/owner/bookings" : "#"} className={`flex h-10 items-center gap-3 rounded-[7px] px-3 text-[12px] ${item === "My Bookings" ? "bg-[#A13D3F] font-bold text-white shadow-[0_4px_10px_rgba(161,61,63,.14)]" : "text-[#625758] hover:bg-[#fff4f2]"}`}><span className="w-4 text-[16px]">{item === "My Bookings" ? "▣" : "▦"}</span>{item}</Link>)}</nav>
        <Link href="/" className="mt-auto flex gap-3 border-t border-[#ead7d6] px-2 pt-5 text-[12px] text-[#625758]">⇥ <span>Logout</span></Link>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="flex h-[64px] items-center justify-end border-b border-[#efdada] bg-white px-6 md:px-10"><div className="flex items-center gap-3 text-[#302a2a]"><span className="mr-4 hidden text-[15px] text-[#A13D3F] sm:inline">♧</span><span className="grid h-8 w-8 place-items-center rounded-full bg-[#3f607a] text-[9px] text-white">JP</span><strong className="hidden text-[11px] sm:block">John Perera</strong></div></header>
        <div className="mx-auto max-w-[1180px] px-5 py-8 md:px-10 md:py-11">
          <div className="mb-5"><h1 className="m-0 text-[26px] font-bold tracking-[-1px]">My Bookings</h1></div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" aria-label="Booking status filters">{statusFilters.map((filter) => <button type="button" key={filter} onClick={() => changeFilter(filter)} className={`rounded-[5px] px-4 py-2 text-[9px] font-semibold ${statusFilter === filter ? "bg-[#A13D3F] text-white" : "text-[#625758] hover:bg-[#fff0ef]"}`}>{filter}</button>)}</div>
            <label className="flex items-center gap-2 text-[9px] text-[#625758]"><span className="sr-only">Filter by date</span><select value={dateFilter} onChange={(event) => changeDateFilter(event.target.value as DateFilter)} className="h-8 rounded-[7px] border border-[#ead7d5] bg-white px-3 text-[9px] outline-none focus:border-[#A13D3F]"><option>All Dates</option><option>Today</option><option>This Week</option><option>This Month</option></select></label>
          </div>
          <div className="grid grid-cols-[1.8fr_1fr_.8fr_1.25fr_1fr_1fr_18px] gap-3 px-3 pb-2 text-[7px] font-semibold uppercase tracking-[.1em] text-[#9b8e8f]"><span>Sitter</span><span>Service</span><span>Pet</span><span>Dates</span><span>Status</span><span>Price</span><span>Action</span></div>
          <div className="grid gap-2">{visibleBookings.map((booking) => <Link href={`/owner/bookings/${booking.id}`} key={booking.id} className="grid min-h-[56px] grid-cols-[1.8fr_1fr_.8fr_1.25fr_1fr_1fr_18px] items-center gap-3 rounded-[10px] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(68,38,39,.04)] transition hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(68,38,39,.09)]">
            <div className="flex min-w-0 items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e5d5bc] text-[9px] font-bold text-[#795349]">{booking.initials}</span><div className="min-w-0"><strong className="block truncate text-[10px]">{booking.sitter}</strong><small className="block text-[8px] text-[#A13D3F]">★ {booking.rating}</small></div></div>
            <span className="flex items-center gap-1 text-[8px] text-[#625758]"><span className="grid h-4 w-4 place-items-center rounded-[3px] bg-[#f8ddd8] text-[#A13D3F]">{serviceIcon(booking.service)}</span>{booking.service}</span>
            <span className="text-[8px] text-[#625758]">{booking.pet}</span><span className="text-[8px] leading-tight text-[#625758]">{booking.dates}</span>
            <span className={`w-fit rounded-full px-2 py-1 text-[7px] font-bold ${booking.status === "Upcoming" ? "bg-[#e3edff] text-[#4a82d1]" : booking.status === "In Progress" ? "bg-[#d9f6ef] text-[#24977e]" : booking.status === "Completed" ? "bg-[#def7e6] text-[#269451]" : "bg-[#fbe1df] text-[#c35353]"}`}>{booking.status}</span>
            <span className="text-[9px] font-semibold text-[#A13D3F]">{booking.price}</span><span className="text-[15px] text-[#6b5b5c]">›</span>
          </Link>)}</div>
          {visibleBookings.length === 0 && <div className="rounded-[10px] bg-white px-3 py-12 text-center text-[11px] text-[#918485]">No bookings match these filters.</div>}
          <div className="mt-5 flex items-center justify-between text-[8px] text-[#817576]"><span>Showing {visibleBookings.length} of {filteredBookings.length} bookings</span><div className="flex items-center gap-1"><button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid h-7 w-7 place-items-center rounded-full border border-[#f0e2e0] disabled:opacity-40">‹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button type="button" key={pageNumber} onClick={() => setPage(pageNumber)} className={`grid h-7 w-7 place-items-center rounded-full text-[8px] ${currentPage === pageNumber ? "bg-[#A13D3F] font-bold text-white" : "text-[#625758]"}`}>{pageNumber}</button>)}<button type="button" aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="grid h-7 w-7 place-items-center rounded-full border border-[#f0e2e0] disabled:opacity-40">›</button></div></div>
        </div>
      </section>
    </main>
  );
}
