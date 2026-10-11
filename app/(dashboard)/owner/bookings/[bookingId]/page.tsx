"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getBooking, type BookingStatus } from "../../../../../lib/mock-bookings";

const navItems = ["Dashboard", "My Pets", "Find a Sitter", "My Bookings", "Messages", "Marketplace", "Blogs", "My Profile"];

function PawMark() {
  return <span className="grid h-[17px] w-[17px] place-items-center rounded-[5px] bg-[#A13D3F] text-[9px] text-white">♥</span>;
}

function statusClass(status: BookingStatus) {
  return status === "Cancelled" ? "bg-[#fbe1df] text-[#c35353]" : status === "Completed" ? "bg-[#def7e6] text-[#269451]" : "bg-[#d9f6ef] text-[#24977e]";
}

export default function BookingDetailsPage() {
  const params = useParams<{ bookingId: string }>();
  const booking = getBooking(params.bookingId ?? "booking-001");
  const isConfirmed = booking.status !== "Cancelled";

  return (
    <main className="min-h-screen bg-[#fffafa] font-[Inter,Arial,sans-serif] text-[#2d2526] md:flex">
      <aside className="hidden min-h-screen w-[250px] shrink-0 flex-col border-r border-[#efdada] bg-white px-4 pb-6 pt-7 md:flex">
        <Link href="/" className="flex items-start gap-2 px-2 pb-8 text-[21px] font-bold leading-none text-[#A13D3F]"><PawMark /><span>Pet<span>Sphere</span><small className="mt-2 block text-[7px] font-medium tracking-[.55px] text-[#594d4e]">PET CARE PLATFORM</small></span></Link>
        <nav className="grid gap-2" aria-label="Owner navigation">{navItems.map((item) => <Link key={item} href={item === "Find a Sitter" ? "/owner/bookings/new" : item === "My Bookings" ? "/owner/bookings" : "#"} className={`flex h-10 items-center gap-3 rounded-[7px] px-3 text-[12px] ${item === "My Bookings" ? "bg-[#A13D3F] font-bold text-white shadow-[0_4px_10px_rgba(161,61,63,.14)]" : "text-[#625758] hover:bg-[#fff4f2]"}`}><span className="w-4 text-[16px]">{item === "My Bookings" ? "▣" : "▦"}</span>{item}</Link>)}</nav>
        <Link href="/" className="mt-auto flex gap-3 border-t border-[#ead7d6] px-2 pt-5 text-[12px] text-[#625758]">⇥ <span>Logout</span></Link>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="flex h-[64px] items-center justify-end border-b border-[#efdada] bg-white px-6 md:px-10"><div className="flex items-center gap-3 text-[#302a2a]"><span className="mr-4 hidden text-[15px] text-[#A13D3F] sm:inline">♧</span><span className="grid h-8 w-8 place-items-center rounded-full bg-[#3f607a] text-[9px] text-white">JP</span><strong className="hidden text-[11px] sm:block">John Perera</strong></div></header>
        <div className="mx-auto max-w-[1120px] px-5 py-6 md:px-8 md:py-8">
          <p className="mb-1 text-[8px] text-[#817576]">Dashboard &gt; My Bookings &gt; <span className="font-semibold text-[#A13D3F]">{booking.bookingNumber}</span></p>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><h1 className="m-0 text-[20px] font-bold">Booking {booking.bookingNumber}</h1><span className={`rounded-full px-2.5 py-1 text-[8px] font-bold ${statusClass(booking.status)}`}>● {isConfirmed ? "Confirmed" : "Cancelled"}</span></div><div className="flex gap-2"><button type="button" onClick={() => window.alert("Your invoice download will begin shortly.")} className="rounded-[8px] border border-[#d8c4c2] bg-white px-3 py-2 text-[9px] text-[#625758]">⇩ Download Invoice</button><button type="button" onClick={() => window.alert(`Message ${booking.sitter}`)} className="rounded-[8px] bg-[#A13D3F] px-3 py-2 text-[9px] font-semibold text-white">▤ Message Sitter</button></div></div>

          <section className="mb-5 rounded-[14px] border border-[#efdcda] bg-white px-5 py-5 shadow-[0_4px_18px_rgba(68,38,39,.04)]"><div className="grid grid-cols-4">
            {["Requested", "Confirmed", "Payment", "Completed"].map((stage, index) => <div key={stage} className="relative text-center"><div className="absolute left-0 right-0 top-2.5 h-px bg-[#decfcd] first:hidden" /><span className={`relative z-10 mx-auto grid h-5 w-5 place-items-center rounded-full text-[9px] text-white ${index === 0 ? "bg-[#168866]" : index === 1 && isConfirmed ? "bg-[#A13D3F]" : "bg-[#d8cdcc]"}`}>{index === 0 ? "✓" : index === 1 && isConfirmed ? "⟳" : "○"}</span><strong className={`mt-1 block text-[8px] ${index === 1 && isConfirmed ? "text-[#A13D3F]" : "text-[#66595a]"}`}>{stage}</strong><small className="block text-[8px] text-[#817576]">{index === 0 ? "Oct 20, 10:30 AM" : index === 1 && isConfirmed ? "Current State" : "Pending"}</small></div>)}
          </div></section>

          <div className="grid gap-5 lg:grid-cols-[1.65fr_.9fr]">
            <div className="grid gap-5">
              <section className="flex gap-4 rounded-[14px] border border-[#efdcda] bg-white p-3 shadow-[0_4px_18px_rgba(68,38,39,.04)]"><div className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-[9px] bg-[#d9c29e] text-[30px]">🐕</div><div className="min-w-0 flex-1"><h2 className="m-0 text-[11px] font-bold">{booking.pet}&apos;s Stay</h2><p className="mb-1 mt-2 text-[9px] text-[#625758]">⌂ Service: {booking.service}</p><p className="m-0 text-[9px] text-[#625758]">▣ Dates: {booking.startDate} - {booking.endDate}</p><div className="mt-2 flex flex-wrap gap-1"><span className="rounded-full bg-[#f9ddd6] px-2 py-1 text-[8px] text-[#9a5c56]">{booking.nights} Nights</span><span className="rounded-full bg-[#fbdedc] px-2 py-1 text-[8px] text-[#b64f50]">Emergency Care Provided</span></div></div><div className="grid w-[72px] shrink-0 place-items-center rounded-[9px] bg-[#f7dddd] text-center"><small className="text-[8px] text-[#817576]">Total</small><strong className="text-[9px] text-[#A13D3F]">{booking.price}</strong></div></section>
              <div className="grid gap-5 sm:grid-cols-2"><section className="rounded-[14px] border border-[#efdcda] bg-white p-3"><h2 className="m-0 text-[9px] font-semibold">▤ Special Instructions</h2><p className="mb-0 mt-2 rounded-[8px] border-l-2 border-[#A13D3F] bg-[#fff0ee] p-2 text-[9px] leading-[1.45] text-[#66595a]">&quot;{booking.specialInstructions}&quot;</p></section><section className="rounded-[14px] border border-[#efdcda] bg-white p-3"><h2 className="m-0 text-[9px] font-semibold">♙ Sitter Contact</h2><div className="mt-2 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9c29e] text-[9px] font-bold text-[#795349]">{booking.initials}</span><div><strong className="block text-[9px]">John Perera</strong><small className="block text-[8px] text-[#817576]">Verified Sitter</small><span className="text-[8px] text-[#A13D3F]">★ {booking.rating} ({booking.reviews} reviews)</span></div></div><button type="button" onClick={() => window.alert("Profile preview coming soon.")} className="mt-2 w-full rounded-[8px] bg-[#f3dddd] py-1.5 text-[8px] text-[#66595a]">View Profile</button></section></div>
              <section className="rounded-[14px] border border-[#efdcda] bg-white p-3"><div className="flex items-center justify-between"><h2 className="m-0 text-[9px] font-semibold text-[#66595a]">⌖ Care Location</h2><span className="text-[8px] text-[#817576]">{booking.location}</span></div><div className="relative mt-2 h-[128px] overflow-hidden rounded-[9px] bg-[#e8e8e8]" style={{ backgroundImage: "linear-gradient(35deg, transparent 42%, #fff 43%, #fff 46%, transparent 47%), linear-gradient(110deg, transparent 45%, #d0d0d0 46%, #d0d0d0 49%, transparent 50%), repeating-linear-gradient(12deg, #e4e4e4 0 14px, #d8d8d8 15px 16px)" }}><span className="absolute left-1/2 top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#A13D3F] text-white shadow-md">♥</span><div className="absolute bottom-2 right-2 rounded-[7px] bg-white/90 px-2 py-1 text-[8px] shadow-sm"><strong className="block">Booking At: PS-HQ</strong><span>Full Care Station Member 1</span></div></div></section>
            </div>
            <aside className="h-fit rounded-[14px] border border-[#efdcda] bg-white p-4 shadow-[0_4px_18px_rgba(68,38,39,.04)]"><h2 className="m-0 text-[10px] font-semibold">Payment Details</h2><div className="mt-4 grid gap-3 text-[9px] text-[#66595a]"><p className="m-0 flex justify-between"><span>{booking.service} ({booking.nights} nights)</span><strong>{booking.serviceAmount}</strong></p><p className="m-0 flex justify-between"><span>Platform Fee</span><strong>{booking.platformFee}</strong></p><p className="m-0 flex justify-between"><span>Taxes</span><strong>{booking.taxes}</strong></p><p className="m-0 flex justify-between border-t border-[#eadedc] pt-3"><strong>Total Amount</strong><strong className="text-[#A13D3F]">{booking.price}</strong></p></div>            <Link href="/owner/checkout" className="mt-4 block w-full rounded-[9px] bg-[#A13D3F] py-3 text-center text-[10px] font-bold text-white">▣ Pay Now</Link><div className="mt-3 rounded-[8px] bg-[#dff5eb] p-3 text-[8px] leading-[1.4] text-[#168866]">♧ Payment secured and held in escrow by PetSphere Protection.</div><button type="button" onClick={() => window.alert(`Message ${booking.sitter}`)} className="mt-5 w-full rounded-[9px] border border-[#c85e5e] py-2.5 text-[9px] text-[#A13D3F]">▤ Message John</button><button type="button" onClick={() => window.alert("Cancellation is not connected yet.")} className="mt-2 w-full rounded-[9px] border border-[#ead7d5] py-2.5 text-[9px] text-[#66595a]">ⓧ Cancel Booking</button><p className="mb-0 mt-3 text-center text-[8px] leading-[1.4] text-[#817576]">Cancellations before July 22nd are subject to a full refund.</p></aside>
          </div>
        </div>
      </section>
    </main>
  );
}
