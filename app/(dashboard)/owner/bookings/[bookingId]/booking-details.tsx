"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft, CalendarDays, Check, ChevronRight, CircleX, ClipboardList,
  CreditCard, Download, MapPin, MessageCircle, PawPrint, ShieldCheck, Star,
} from "lucide-react";
import { ContactButton } from "../../../../../components/messaging/contact-button";
import type { Booking, BookingStatus } from "../../../../../lib/mock-bookings";

export type DetailsBooking = Omit<Booking, "id" | "date" | "dates" | "status" | "service"> & {
  status: BookingStatus | "Pending" | "Confirmed" | "Rejected";
  service: string;
};

const statusColors: Record<DetailsBooking["status"], string> = {
  Pending: "bg-[#fff1d9] text-[#81520f]",
  Confirmed: "bg-[#fae9e7] text-[#973b40]",
  Rejected: "bg-[#fbe6e6] text-[#a1383c]",
  Upcoming: "bg-[#fae9e7] text-[#973b40]",
  "In Progress": "bg-[#fff1d9] text-[#81520f]",
  Completed: "bg-[#e6f4ed] text-[#216748]",
  Cancelled: "bg-[#fbe6e6] text-[#a1383c]",
};

const stages = ["Requested", "Confirmed", "Payment", "Completed"];
const card = "rounded-2xl border border-[#ecdcd9] bg-white p-5 sm:p-6";
const secondaryAction = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e3cfcc] bg-white px-4 py-2 text-sm font-semibold text-[#653f40] hover:bg-[#fff3f0] disabled:opacity-60";
const primaryAction = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#a13d3f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8f3335] disabled:opacity-60";

function CardTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h2 className="m-0 flex items-center gap-2.5 text-base font-bold">
      <span aria-hidden="true" className="text-[#a13d3f]">{icon}</span>
      {children}
    </h2>
  );
}

export function BookingDetails({ booking, preview = false, contactBookingId }: { booking: DetailsBooking; preview?: boolean; contactBookingId?: string }) {
  const cancelled = booking.status === "Cancelled" || booking.status === "Rejected";
  const completed = booking.status === "Completed";
  const activeStage = cancelled || booking.status === "Pending" ? 0 : completed ? 3 : booking.status === "In Progress" ? 2 : 1;
  const openBooking = !cancelled && !completed;
  const boarding = booking.service.toLowerCase() === "boarding";
  const duration = booking.nights + (booking.nights === 1 ? " night" : " nights");

  return (
    <main className="mx-auto w-full max-w-[1160px] px-4 py-6 text-[#30272a] sm:px-6 lg:px-8 lg:py-9">
      {!preview && (
        <Link href="/owner/bookings" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#973b40]! hover:underline">
          <ArrowLeft size={16} aria-hidden="true" /> My Bookings
        </Link>
      )}
      {preview && (
        <p className="mb-5 text-sm font-medium text-[#786769]">
          Design preview · Sample booking · Actions are disabled
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold text-[#786769]">{booking.bookingNumber}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="m-0 text-3xl font-bold tracking-tight sm:text-4xl">Booking details</h1>
            <span className={"rounded-full px-3 py-1 text-xs font-bold " + statusColors[booking.status]}>
              {booking.status}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={preview} className={secondaryAction} onClick={() => window.alert("Your invoice download will begin shortly.")}>
            <Download size={16} aria-hidden="true" /> Download invoice
          </button>
          <ContactButton role="owner" bookingId={contactBookingId} disabled={preview} label="Message sitter" className={primaryAction} />
        </div>
      </div>

      <section className={card + " mb-5"} aria-label="Booking progress">
        <h2 className="m-0 text-base font-bold">Booking progress</h2>
        {cancelled ? (
          <p className="mb-0 mt-3 flex items-center gap-2 text-sm text-[#a1383c]">
            <CircleX size={16} aria-hidden="true" /> This booking was {booking.status.toLowerCase()}.
          </p>
        ) : (
          <ol className="m-0 mt-4 grid list-none grid-cols-4 p-0">
            {stages.map((stage, index) => {
              const done = index < activeStage || completed;
              const current = index === activeStage;
              return (
                <li key={stage} aria-current={current ? "step" : undefined} className="relative min-w-0 text-center">
                  {index < stages.length - 1 && <span aria-hidden="true" className={"absolute left-1/2 top-4 h-px w-full " + (done ? "bg-[#a13d3f]" : "bg-[#e8d8d6]")} />}
                  <span aria-hidden="true" className={"relative mx-auto grid size-8 place-items-center rounded-full text-xs font-bold " + (done || current ? "bg-[#a13d3f] text-white" : "border border-[#e8d8d6] bg-[#fff8f7] text-[#786769]")}>
                    {done ? <Check size={15} /> : index + 1}
                  </span>
                  <span className={"mt-2 block break-words px-0.5 text-[11px] font-semibold sm:text-sm " + (current ? "text-[#973b40]" : "text-[#66585a]")}>
                    {stage}
                    {done && index !== stages.length - 1 && <span className="sr-only">, complete</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-5">
          <section className={card}>
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#fae9e7] text-[#a13d3f]">
                <PawPrint size={23} aria-hidden="true" />
              </span>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#786769]">{booking.service}</p>
                <h2 className="m-0 text-xl font-bold">{booking.pet}&apos;s booking</h2>
              </div>
            </div>
            <dl className="mb-0 mt-5 grid gap-4 rounded-xl bg-[#fff7f5] p-4 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-[#786769]"><CalendarDays size={16} aria-hidden="true" /> {boarding ? "Drop-off" : "Service date"}</dt>
                <dd className="ml-0 mt-1 text-sm font-semibold">{booking.startDate}</dd>
              </div>
              {(boarding || booking.startDate !== booking.endDate) && (
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-[#786769]"><CalendarDays size={16} aria-hidden="true" /> {boarding ? "Pick-up" : "End date"}</dt>
                  <dd className="ml-0 mt-1 text-sm font-semibold">{booking.endDate}{boarding && <span className="ml-2 font-normal text-[#786769]">· {duration}</span>}</dd>
                </div>
              )}
            </dl>
          </section>

          <div className="grid items-stretch gap-5 md:grid-cols-2">
            <section className={card}>
              <CardTitle icon={<ClipboardList size={19} />}>Care instructions</CardTitle>
              <p className="mb-0 mt-4 rounded-lg border-l-2 border-[#a13d3f] bg-[#fff7f5] p-3 text-sm leading-relaxed text-[#66585a]">
                {booking.specialInstructions || "No special instructions were added."}
              </p>
            </section>
            <section className={card}>
              <CardTitle icon={<MessageCircle size={19} />}>Your sitter</CardTitle>
              <div className="mt-4 flex items-center gap-3">
                <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f4e6d7] text-sm font-bold text-[#704b38]">{booking.initials}</span>
                <div className="min-w-0">
                  <p className="m-0 break-words text-sm font-bold">{booking.sitter}</p>
                  {booking.rating && <p className="mb-0 mt-1 flex items-center gap-1 text-xs text-[#786769]"><Star size={13} className="text-[#a13d3f]" aria-hidden="true" /> {booking.rating} {booking.reviews && " · " + booking.reviews + " reviews"}</p>}
                </div>
              </div>
              <button type="button" disabled={preview} onClick={() => window.alert("Profile preview coming soon.")} className={secondaryAction + " mt-4 w-full"}>
                View profile <ChevronRight size={16} aria-hidden="true" />
              </button>
            </section>
          </div>

          <section className={card}>
            <CardTitle icon={<MapPin size={19} />}>Care location</CardTitle>
            <p className="mb-0 mt-3 text-sm leading-relaxed text-[#66585a]">{booking.location}</p>
          </section>
        </div>

        <aside className={card}>
          <CardTitle icon={<CreditCard size={19} />}>Payment details</CardTitle>
          <dl className="mb-0 mt-5 grid gap-3 text-sm text-[#66585a]">
            {[
              [boarding ? booking.service + " (" + duration + ")" : booking.service, booking.serviceAmount],
              ["Platform fee", booking.platformFee],
              ["Taxes", booking.taxes],
            ].filter(([, value]) => value).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt>{label}</dt>
                <dd className="ml-0 shrink-0 whitespace-nowrap font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2 border-t border-[#ecdcd9] pt-4">
              <dt className="font-bold text-[#30272a]">Total amount</dt>
              <dd className="ml-0 whitespace-nowrap text-xl font-bold tabular-nums text-[#973b40]">{booking.price.replace(/^Rs\.\s*/, "Rs. ")}</dd>
            </div>
          </dl>
          {openBooking && (
            <>
              {preview ? (
                <button type="button" disabled className={primaryAction + " mt-5 w-full"}>Pay now</button>
              ) : (
                <Link href="/owner/checkout" className={primaryAction + " mt-5 w-full text-white!"}>Pay now</Link>
              )}
              <p className="mb-0 mt-3 flex items-start gap-2 rounded-xl bg-[#e9f5ef] p-3 text-xs leading-relaxed text-[#27634f]">
                <ShieldCheck size={17} aria-hidden="true" className="shrink-0" />
                Payment is held in escrow by PetSphere Protection.
              </p>
              <button type="button" disabled={preview} className={secondaryAction + " mt-4 w-full"} onClick={() => window.alert("Cancellation is not connected yet.")}>
                Cancel booking
              </button>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
