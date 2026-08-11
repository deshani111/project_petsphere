"use client";

import { useState } from "react";
import Link from "next/link";
import BookingSummary from "../components/booking-summary";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function displayDate(date: Date) {
  return `${monthNames[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

export default function BookingDatesPage() {
  const [month, setMonth] = useState(new Date(2024, 8, 1));
  const [startDate, setStartDate] = useState<Date | null>(new Date(2024, 8, 11));
  const [endDate, setEndDate] = useState<Date | null>(new Date(2024, 8, 15));
  const [dropOff, setDropOff] = useState("09:00 AM");
  const [pickUp, setPickUp] = useState("05:00 PM");

  const firstWeekday = (month.getDay() + 6) % 7;
  const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstWeekday + totalDays }, (_, index) => index < firstWeekday ? null : new Date(month.getFullYear(), month.getMonth(), index - firstWeekday + 1));
  const selectedLabel = startDate ? `${displayDate(startDate)}${endDate ? ` - ${displayDate(endDate)}` : ""}` : "Select dates";
  const nightCount = startDate && endDate ? Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000)) : 0;

  function selectDate(date: Date) {
    if (!startDate || endDate) {
      setStartDate(date);
      setEndDate(null);
      return;
    }
    if (date.getTime() < startDate.getTime()) {
      setStartDate(date);
      return;
    }
    setEndDate(date);
  }

  function inRange(date: Date) {
    return Boolean(startDate && endDate && date.getTime() >= startDate.getTime() && date.getTime() <= endDate.getTime());
  }

  return (
    <div className="mx-auto mt-2.5 grid max-w-[747px] grid-cols-1 gap-[15px] px-[14px] pb-6 sm:px-[18px] md:grid-cols-[minmax(420px,1fr)_170px]">
      <section className="min-w-0">
        <h1 className="m-0 text-[19px] font-bold tracking-[-.8px] md:text-[21px]">When do you need care?</h1>
        <p className="mb-[18px] mt-1.5 text-[9px] text-[#7c7071]">Select the dates and times for your companion&apos;s boarding experience.</p>
        <div className="rounded-[14px] border border-[#e9cfcd] bg-white p-3 sm:p-[13px]">
          <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><strong className="text-[11px]">{monthNames[month.getMonth()]} {month.getFullYear()}</strong><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month" className="grid h-5 w-5 place-items-center rounded-full border border-[#ead5d3] text-[11px] text-[#A13D3F]">‹</button><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" className="grid h-5 w-5 place-items-center rounded-full border border-[#ead5d3] text-[11px] text-[#A13D3F]">›</button></div><span className="rounded-full bg-[#fff0ef] px-2.5 py-1 text-[7px] text-[#A13D3F]"><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#A13D3F]" />Selected Range</span></div>
          <div className="grid grid-cols-7 text-center">{weekdays.map((day) => <span key={day} className="mb-2 text-[7px] font-medium uppercase tracking-[.4px] text-[#a39798]">{day}</span>)}{calendarDays.map((date, index) => {
            if (!date) return <span key={`empty-${index}`} className="h-[37px]" />;
            const key = dateKey(date);
            const isStart = startDate && key === dateKey(startDate);
            const isEnd = endDate && key === dateKey(endDate);
            const selected = isStart || isEnd;
            return <button key={key} type="button" onClick={() => selectDate(date)} className={`relative h-[37px] text-[9px] ${inRange(date) ? "bg-[#fce4e1]" : ""} ${isStart ? "rounded-l-full" : ""} ${isEnd ? "rounded-r-full" : ""}`}><span className={`relative z-10 inline-grid h-[25px] w-[25px] place-items-center rounded-full ${selected ? "bg-[#A13D3F] font-bold text-white shadow-[0_3px_6px_rgba(161,61,63,.2)]" : "hover:bg-[#fff0ef]"}`}>{date.getDate()}</span></button>;
          })}</div>
          <div className="mt-3 grid gap-3 border-t border-[#efdcda] pt-4 sm:grid-cols-2"><label className="text-[8px] text-[#776b6c]">Estimated Drop-off<select value={dropOff} onChange={(event) => setDropOff(event.target.value)} className="mt-1 block h-[27px] w-full rounded-[7px] border border-[#e6cfcd] bg-[#fff4f2] px-2 text-[8px] text-[#493d3e] outline-none"><option>09:00 AM</option><option>10:00 AM</option><option>11:00 AM</option></select></label><label className="text-[8px] text-[#776b6c]">Estimated Pick-up<select value={pickUp} onChange={(event) => setPickUp(event.target.value)} className="mt-1 block h-[27px] w-full rounded-[7px] border border-[#e6cfcd] bg-[#fff4f2] px-2 text-[8px] text-[#493d3e] outline-none"><option>04:00 PM</option><option>05:00 PM</option><option>06:00 PM</option></select></label></div>
        </div>
        <div className="mt-6 flex items-center justify-between px-[12px]"><Link href="/owner/bookings" className="text-[9px] text-[#A13D3F]">Cancel</Link><div className="flex gap-3"><Link href="/owner/bookings/new/pet" className="rounded-[8px] border border-[#DCC0BF] px-3 py-[8px] text-[9px] text-[#A13D3F]">← Previous</Link><Link href="/owner/bookings/new/instructions" className="rounded-[8px] bg-[#A13D3F] px-4 py-[9px] text-[9px] font-bold text-white shadow-[0_5px_10px_rgba(161,61,63,.17)]">Next →</Link></div></div>
      </section>
      <BookingSummary service="Boarding" price="8,500.00" unit="/ night" dateLabel={selectedLabel} nightsLabel={nightCount ? `${nightCount} Night${nightCount === 1 ? "" : "s"} Total` : "Choose an end date"} />
    </div>
  );
}
