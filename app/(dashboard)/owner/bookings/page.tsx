"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type BookingStatus = "Upcoming" | "Completed" | "Cancelled";

const bookings: Array<{ id: string; sitter: string; initials: string; pet: string; service: string; date: string; status: BookingStatus; amount: string }> = [
  { id: "BK-1042", sitter: "David Mitchell", initials: "DM", pet: "Charlie", service: "Boarding", date: "Oct 12 - Oct 15", status: "Upcoming", amount: "Rs. 27,000" },
  { id: "BK-1038", sitter: "James Wilson", initials: "JW", pet: "Luna", service: "Walking", date: "Oct 03, 2024", status: "Upcoming", amount: "Rs. 4,000" },
  { id: "BK-1027", sitter: "Sophia Lee", initials: "SL", pet: "Cooper", service: "Grooming", date: "Sep 28, 2024", status: "Completed", amount: "Rs. 6,000" },
  { id: "BK-1019", sitter: "Noah Johnson", initials: "NJ", pet: "Misty", service: "Boarding", date: "Sep 17 - Sep 19", status: "Completed", amount: "Rs. 17,000" },
  { id: "BK-1008", sitter: "Maya Patel", initials: "MP", pet: "Charlie", service: "Training", date: "Sep 10, 2024", status: "Cancelled", amount: "Rs. 5,000" },
  { id: "BK-1002", sitter: "Emma Roberts", initials: "ER", pet: "Luna", service: "Walking", date: "Aug 29, 2024", status: "Completed", amount: "Rs. 4,000" },
];

const navItems = ["Dashboard", "My Pets", "Find a Sitter", "My Bookings", "Messages", "Marketplace", "Blogs", "My Profile"];
const statusFilters = ["All", "Upcoming", "Completed", "Cancelled"] as const;

function PawMark() {
  return <span className="grid h-[17px] w-[17px] place-items-center rounded-[5px] bg-[#A13D3F] text-[9px] text-white">♥</span>;
}

export default function OwnerBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");
  const [serviceFilter, setServiceFilter] = useState("All services");
  const [search, setSearch] = useState("");

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const matchesStatus = statusFilter === "All" || booking.status === statusFilter;
    const matchesService = serviceFilter === "All services" || booking.service === serviceFilter;
    const searchText = `${booking.sitter} ${booking.pet} ${booking.service} ${booking.id}`.toLowerCase();
    return matchesStatus && matchesService && searchText.includes(search.trim().toLowerCase());
  }), [search, serviceFilter, statusFilter]);

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
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#A13D3F]">Owner dashboard</p><h1 className="m-0 text-[26px] font-bold tracking-[-1px]">My Bookings</h1><p className="mb-0 mt-2 text-[12px] text-[#7c7071]">View and manage all your pet care bookings.</p></div><Link href="/owner/bookings/new" className="rounded-[9px] bg-[#A13D3F] px-4 py-3 text-[11px] font-bold text-white shadow-[0_7px_15px_rgba(161,61,63,.18)]">+ New Booking</Link></div>

          <section className="rounded-[14px] border border-[#efdcda] bg-white p-4 shadow-[0_4px_22px_rgba(68,38,39,.04)] md:p-5">
            <div className="flex flex-col gap-4 border-b border-[#f0e2e0] pb-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2" aria-label="Booking status filters">{statusFilters.map((filter) => <button type="button" key={filter} onClick={() => setStatusFilter(filter)} className={`rounded-full px-3 py-2 text-[10px] font-semibold transition ${statusFilter === filter ? "bg-[#A13D3F] text-white" : "bg-[#fff4f2] text-[#75696a] hover:bg-[#fae4e1]"}`}>{filter}</button>)}</div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><span className="sr-only">Search bookings</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sitter, pet or booking" className="h-9 w-full rounded-[8px] border border-[#ead7d5] bg-[#fffafa] px-3 text-[10px] outline-none placeholder:text-[#a39899] focus:border-[#A13D3F] sm:w-[205px]" /></label><label><span className="sr-only">Filter by service</span><select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)} className="h-9 w-full rounded-[8px] border border-[#ead7d5] bg-[#fffafa] px-3 text-[10px] text-[#625758] outline-none focus:border-[#A13D3F]"><option>All services</option><option>Boarding</option><option>Walking</option><option>Grooming</option><option>Training</option></select></label></div></div>

            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] border-collapse text-left"><thead><tr className="border-b border-[#f0e2e0] text-[9px] uppercase tracking-[.08em] text-[#9b8e8f]"><th className="px-3 py-3 font-semibold">Sitter</th><th className="px-3 py-3 font-semibold">Pet</th><th className="px-3 py-3 font-semibold">Service</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 text-right font-semibold">Total</th></tr></thead><tbody>{filteredBookings.map((booking) => <tr key={booking.id} className="border-b border-[#f7eceb] last:border-0 hover:bg-[#fffafa]"><td className="px-3 py-3"><div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#f6dedb] text-[9px] font-bold text-[#A13D3F]">{booking.initials}</span><div><strong className="block text-[11px]">{booking.sitter}</strong><small className="text-[8px] text-[#998e8f]">{booking.id}</small></div></div></td><td className="px-3 py-3 text-[10px] text-[#5f5354]">♥ {booking.pet}</td><td className="px-3 py-3 text-[10px] text-[#5f5354]"><span className="rounded-full bg-[#fff0ef] px-2 py-1 text-[9px] text-[#8e5253]">{booking.service}</span></td><td className="px-3 py-3 text-[10px] text-[#5f5354]">{booking.date}</td><td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[8px] font-bold ${booking.status === "Upcoming" ? "bg-[#e2f6ed] text-[#168866]" : booking.status === "Completed" ? "bg-[#e6f0fc] text-[#3974b8]" : "bg-[#f9e2e0] text-[#b64f50]"}`}>{booking.status}</span></td><td className="px-3 py-3 text-right text-[10px] font-bold text-[#5a4e4f]">{booking.amount}</td></tr>)}{filteredBookings.length === 0 && <tr><td colSpan={6} className="px-3 py-12 text-center text-[11px] text-[#918485]">No bookings match these filters.</td></tr>}</tbody></table></div>
            <p className="mb-0 mt-4 text-[10px] text-[#8c8081]">Showing {filteredBookings.length} of {bookings.length} bookings</p>
          </section>
        </div>
      </section>
    </main>
  );
}
