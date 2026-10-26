"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CalendarDays, Clock3, Dog, FileText, Heart,
  Mail, MessageCircle, PawPrint, Scissors, Search, ShieldCheck, Wallet,
} from "lucide-react";
import { type ApiPet, getApiMessage } from "../../lib/pet-api";
import PetCard from "../pet-card";

export type DashboardBooking = {
  id: string;
  sitter: string;
  pet: string;
  service: string;
  date: string | null;
  endDate: string | null;
  status: string;
  amount: string;
  sitterImage?: string | null;
};

type DashboardOverviewProps = {
  userName: string;
  activeBookings: number;
  totalBookings: number;
  unreadMessages: number;
  bookings: DashboardBooking[];
};

const statusTone = (status: string) => {
  const value = status.toLowerCase();
  if (["confirmed", "completed", "in_progress"].includes(value)) return "bg-emerald-50 text-emerald-700";
  if (["cancelled", "canceled", "declined", "rejected"].includes(value)) return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
};

function formatDate(value: string | null) {
  if (!value) return "Date to be confirmed";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function isUpcomingDate(value: string | null, now: number) {
  if (!value) return false;
  const bookingDay = new Date(value);
  const today = new Date(now);
  bookingDay.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return bookingDay.getTime() >= today.getTime();
}

const serviceCards = [
  { title: "Pet Boarding", detail: "Safe, loving overnight care for when you’re away from home.", icon: Heart },
  { title: "Dog Walking", detail: "Daily exercise and companionship tailored to your dog.", icon: Dog },
  { title: "Pet Grooming", detail: "In-home or salon grooming, bathing, and coat care.", icon: Scissors },
];

export function DashboardOverview({ userName, activeBookings, totalBookings, unreadMessages, bookings }: DashboardOverviewProps) {
  const router = useRouter();
  const [pets, setPets] = useState<ApiPet[]>([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [petsError, setPetsError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ApiPet | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [bookingTab, setBookingTab] = useState<"Upcoming" | "Recent" | "Completed">("Upcoming");
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  // Keep using the existing owner-scoped pets API for both initial data and CRUD refreshes.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/pets", { cache: "no-store" });
        if (!response.ok) throw new Error(await getApiMessage(response));
        const data: ApiPet[] = await response.json();
        if (active) setPets(data);
      } catch (error) {
        if (active) setPetsError(error instanceof Error ? error.message : "Could not load your pets.");
      } finally {
        if (active) setPetsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const status = booking.status.toLowerCase();
    if (bookingTab === "Completed") return status === "completed";
    if (bookingTab === "Upcoming") return currentTime !== null && isUpcomingDate(booking.date, currentTime) && !["completed", "cancelled", "canceled", "declined", "rejected"].includes(status);
    return status !== "completed" && (currentTime === null || !booking.date || !isUpcomingDate(booking.date, currentTime));
  }).slice(0, 3);
  const nextBooking = useMemo(() => currentTime === null ? undefined : bookings
    .filter((booking) => isUpcomingDate(booking.date, currentTime) && !["completed", "cancelled", "canceled", "declined", "rejected"].includes(booking.status.toLowerCase()))
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())[0], [bookings, currentTime]);

  async function confirmDeletePet() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/pets/${encodeURIComponent(deleteTarget.pet_id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await getApiMessage(response));
      setPets((current) => current.filter((pet) => pet.pet_id !== deleteTarget.pet_id));
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete this pet.");
    } finally {
      setIsDeleting(false);
    }
  }

  const displayedPets = pets.slice(0, 4);
  const tabs = ["Upcoming", "Recent", "Completed"] as const;

  return (
    <main className="min-w-0 bg-[#f6f7f9] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <section className="mx-auto max-w-[1480px]">
        <div className="relative isolate mb-5 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#B7434E] via-[#A63842] to-[#7D202B] px-5 py-6 text-white shadow-[0_18px_45px_rgba(125,32,43,0.2)] sm:px-8 sm:py-8 lg:py-9">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 hidden size-80 rounded-full bg-[#F4B4BC]/20 blur-3xl sm:block" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-[28%] hidden size-64 rounded-full bg-[#F4B4BC]/15 blur-3xl sm:block" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 top-4 hidden size-64 rounded-full border-2 border-dotted border-white/20 sm:block" />
          <div aria-hidden="true" className="pointer-events-none absolute right-[40%] top-7 hidden text-white/25 sm:block"><PawPrint size={23} /></div>
          <div aria-hidden="true" className="pointer-events-none absolute right-[36%] bottom-8 hidden text-[#ffd9de]/50 sm:block"><Heart size={16} fill="currentColor" /></div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[54%] sm:block lg:w-[51%]">
            <Image src="/petcare.jpg" alt="" fill sizes="(min-width: 1280px) 48vw, (min-width: 640px) 54vw, 0px" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#A63842] via-[#A63842]/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#7D202B]/10 via-transparent to-[#B7434E]/10" />
          </div>
          <div className="relative z-10 sm:max-w-[67%] lg:max-w-[61%]">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur-sm"><ShieldCheck size={14} /> Trusted Care Platform</span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Welcome back, {userName}!</h1>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/owner/sitters" className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-xs font-bold !text-[#852c36] shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-lg"><Search size={15} className="!text-[#852c36]" /> Explore Services</Link>
              <Link href="/owner/bookings" className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 text-xs font-semibold text-white shadow-sm backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/20"><CalendarDays size={15} /> Manage Bookings</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            { title: "My Pets", value: petsLoading ? "—" : pets.length, subtitle: "Total registered pets", icon: PawPrint, color: "text-rose-600 bg-rose-50" },
            { title: "Active Bookings", value: activeBookings, subtitle: "Currently active", icon: CalendarDays, color: "text-sky-700 bg-sky-50" },
            { title: "Total Bookings", value: totalBookings, subtitle: "All bookings made", icon: Clock3, color: "text-amber-700 bg-amber-50" },
            { title: "Unread Messages", value: unreadMessages, subtitle: "Need your attention", icon: Mail, color: "text-orange-700 bg-orange-50" },
          ].map(({ title, value, subtitle, icon: Icon, color }) => <article key={title} className="min-h-[96px] rounded-2xl border border-rose-100/80 bg-white p-3.5 shadow-[0_8px_24px_rgba(91,52,51,.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(91,52,51,.1)] sm:flex sm:items-center sm:gap-3.5 sm:p-4">
            <span className={`mb-2 grid size-10 shrink-0 place-items-center rounded-xl sm:mb-0 sm:size-12 ${color}`}><Icon size={19} strokeWidth={2.1} /></span>
            <div><p className="text-[10px] font-bold uppercase tracking-[.11em] text-slate-500">{title}</p><p className="mt-1 text-xl font-bold leading-none tracking-tight text-slate-900">{value}</p><p className="mt-1.5 text-[10px] text-slate-500">{subtitle}</p></div>
          </article>)}
        </div>

        <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(250px,.9fr)]">
          <section className="xl:col-span-2">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div><h2 className="text-base font-bold text-slate-800">My Pet Family</h2><p className="mt-1 text-[11px] text-slate-500">Your companions are always in good hands.</p></div>
              <div className="flex items-center gap-2">
                <Link href="/owner/pets" className="text-[10px] font-semibold text-[#a32e34] hover:underline">View All Pets</Link>
                {!petsLoading && !petsError && pets.length >= 4 && <Link href="/owner/pets/add" className="inline-flex h-8 items-center rounded-md border border-[#a32e34] bg-white px-3 text-[10px] font-semibold text-[#a32e34] transition hover:bg-rose-50">+ Add Pet</Link>}
              </div>
            </div>
            {petsLoading ? <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">Loading your pets…</div> : petsError ? <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{petsError}</div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {displayedPets.map((pet) => <PetCard key={pet.pet_id} image={pet.photo || undefined} name={pet.pet_name} type={pet.species || "Pet"} breed={pet.breed || "Unknown"} href={`/owner/pets/${pet.pet_id}`} onEdit={() => router.push(`/owner/pets/${pet.pet_id}/edit`)} onDelete={() => { setDeleteError(""); setDeleteTarget(pet); }} />)}
              {pets.length < 4 && <Link href="/owner/pets/add" className="group block min-h-[300px]" aria-label="Add another pet">
                  <article className="flex h-full flex-col rounded-2xl border-2 border-dashed border-[#e6c7c7] bg-[#fffaf9] p-3 shadow-[0_10px_30px_rgba(91,52,51,0.04)] transition hover:border-[#d99a9d] hover:bg-[#fff6f5] sm:p-4">
                    <div className="relative mb-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[18px] bg-white/40">
                      <div className="absolute inset-0 rounded-[18px] border border-dashed border-[#e8c7c7]" />
                      <span className="relative grid size-16 place-items-center rounded-full border-2 border-[#d99a9d] text-[38px] font-light leading-none text-[#ab3d42] transition group-hover:bg-white">+</span>
                    </div>
                    <div className="shrink-0 pb-1 text-center">
                      <h3 className="text-[13px] font-bold text-[#403537] sm:text-sm">Add another pet</h3>
                      <p className="mt-1 text-[10px] text-[#7f7072] sm:text-xs">Grow your pet family in just a few steps.</p>
                    </div>
                  </article>
                </Link>}
            </div>}
          </section>

          <div className="min-w-0 space-y-5">
            <section id="bookings" className="scroll-mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,.04)] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-bold text-slate-800">Your Bookings</h2><p className="mt-1 text-[10px] text-slate-500">Active reservations and service history</p></div><div className="flex gap-1 rounded-md bg-slate-50 p-1" role="tablist" aria-label="Filter bookings">{tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={bookingTab === tab} onClick={() => setBookingTab(tab)} className={`rounded px-2 py-1 text-[9px] font-medium ${bookingTab === tab ? "bg-white text-[#a33237] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{tab}</button>)}</div></div>
              <div className="mt-4 space-y-2.5">
                {filteredBookings.map((booking) => <article key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                  <div className="flex min-w-0 items-center gap-3"><div className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-rose-50 text-[#a33237]">{booking.sitterImage ? <Image src={booking.sitterImage} alt="" fill unoptimized sizes="36px" className="object-cover" /> : <PawPrint size={15} />}</div><div className="min-w-0"><p className="truncate text-[11px] font-semibold text-slate-800">{booking.sitter}</p><p className="mt-0.5 truncate text-[9px] text-slate-500">{booking.service} · {booking.pet}</p><p className="mt-1 flex items-center gap-1 text-[9px] text-slate-400"><CalendarDays size={11} />{formatDate(booking.date)}</p></div></div>
                  <div className="flex items-center gap-2"><span className="text-[11px] font-bold text-slate-800">{booking.amount}</span><span className={`rounded-full px-2 py-1 text-[8px] font-semibold capitalize ${statusTone(booking.status)}`}>{booking.status.replace(/_/g, " ")}</span></div>
                </article>)}
                {filteredBookings.length === 0 && <div className="rounded-lg bg-slate-50 px-4 py-8 text-center"><CalendarDays className="mx-auto text-slate-400" size={22} /><p className="mt-2 text-xs font-semibold text-slate-700">No {bookingTab.toLowerCase()} bookings</p><p className="mt-1 text-[10px] text-slate-500">Your booking activity will show here.</p></div>}
              </div>
              <Link href="/owner/bookings" className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#a33237] hover:underline">View all bookings <ArrowRight size={12} /></Link>
            </section>

            <section>
              <div className="mb-3"><h2 className="text-base font-bold text-slate-800">Explore Pet Care Services</h2><p className="mt-1 text-[10px] text-slate-500">Professional care for every pet&apos;s needs</p></div>
              <div className="grid gap-3 sm:grid-cols-3">{serviceCards.map(({ title, detail, icon: Icon }) => <article key={title} className="flex min-h-[152px] flex-col rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_1px_3px_rgba(15,23,42,.04)]"><span className="mb-3 grid size-8 place-items-center rounded-lg bg-rose-50 text-[#a33237]"><Icon size={16} /></span><h3 className="text-[11px] font-bold text-slate-800">{title}</h3><p className="mt-1.5 flex-1 text-[9px] leading-relaxed text-slate-500">{detail}</p><Link href="/owner/sitters" className="mt-3 inline-flex w-fit rounded-full border border-rose-200 px-2.5 py-1 text-[9px] font-semibold text-[#a33237] hover:bg-rose-50">Explore {title.split(" ").at(-1)}</Link></article>)}</div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,.04)]">
              <div className="flex items-start justify-between"><div><h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-700">Next Care Session</h2><p className="mt-1 text-[9px] text-slate-400">Your nearest upcoming booking</p></div><span className="rounded-full bg-rose-50 px-2 py-1 text-[8px] font-semibold text-[#a33237]">{nextBooking ? "Upcoming" : "No bookings"}</span></div>
              {nextBooking ? <div className="mt-4"><p className="text-[12px] font-bold text-slate-800">{nextBooking.service}</p><p className="mt-1 text-[10px] text-slate-500">For {nextBooking.pet} with {nextBooking.sitter}</p><p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-600"><Clock3 size={12} className="text-[#a33237]" />{formatDate(nextBooking.date)}</p><div className="mt-3 flex items-center justify-between"><span className={`rounded-full px-2 py-1 text-[8px] font-semibold capitalize ${statusTone(nextBooking.status)}`}>{nextBooking.status.replace(/_/g, " ")}</span><Link href="/owner/bookings" className="text-[9px] font-semibold text-[#a33237] hover:underline">View bookings</Link></div></div> : <div className="mt-4 rounded-md bg-slate-50 p-3 text-center"><p className="text-[10px] text-slate-600">No upcoming care sessions yet.</p><Link href="/owner/sitters" className="mt-2 inline-flex text-[9px] font-semibold text-[#a33237]">Find a sitter <ArrowRight size={11} className="ml-1" /></Link></div>}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,.04)]"><h2 className="text-[11px] font-bold text-slate-800">Quick Actions</h2><div className="mt-3 grid grid-cols-2 gap-2"><Link href="/owner/pets/add" className="flex min-h-14 flex-col justify-center rounded-md border border-slate-100 bg-slate-50 px-2.5 text-[9px] font-semibold text-slate-700 hover:border-rose-200 hover:bg-rose-50"><PawPrint size={14} className="mb-1 text-[#a33237]" />Add a Pet</Link><Link href="/owner/sitters" className="flex min-h-14 flex-col justify-center rounded-md border border-slate-100 bg-slate-50 px-2.5 text-[9px] font-semibold text-slate-700 hover:border-rose-200 hover:bg-rose-50"><CalendarDays size={14} className="mb-1 text-[#a33237]" />Book Care</Link><button type="button" disabled title="Owner messaging is not implemented yet" className="flex min-h-14 cursor-not-allowed flex-col justify-center rounded-md border border-slate-100 bg-slate-50 px-2.5 text-left text-[9px] font-semibold text-slate-400"><MessageCircle size={14} className="mb-1 text-slate-400" />Message Sitter</button><button type="button" disabled title="Owner receipts are not implemented yet" className="flex min-h-14 cursor-not-allowed flex-col justify-center rounded-md border border-slate-100 bg-slate-50 px-2.5 text-left text-[9px] font-semibold text-slate-400"><Wallet size={14} className="mb-1 text-slate-400" />Past Receipts</button></div><p className="mt-2 text-[9px] leading-relaxed text-slate-400">Messaging and owner receipt pages are not available in the current application.</p></section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,.04)]"><div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wide text-slate-600"><FileText size={12} className="text-[#a33237]" /> Pet Care Tip</div><h2 className="mt-3 text-[12px] font-bold leading-snug text-slate-800">Paw Pad Care for Crisp Weather</h2><p className="mt-2 text-[9px] leading-relaxed text-slate-500">Cold, dry weather can leave paws rough. Check between the toes after walks, rinse away salt, and use a pet-safe balm to keep pads comfortable.</p><Link href="/blog" className="mt-3 inline-flex items-center gap-1 text-[9px] font-semibold text-[#a33237] hover:underline">Read more <ArrowRight size={11} /></Link></section>
          </aside>
        </div>
      </section>
      {deleteTarget ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6" role="presentation">
        <section role="dialog" aria-modal="true" aria-labelledby="delete-pet-title" className="w-full max-w-md rounded-xl border border-rose-100 bg-white p-5 shadow-2xl">
          <h2 id="delete-pet-title" className="text-base font-semibold text-slate-800">Delete pet?</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Are you sure you want to delete <span className="font-semibold text-[#a33237]">{deleteTarget.pet_name}</span>?</p>
          {deleteError && <p role="alert" className="mt-2 text-xs text-rose-700">{deleteError}</p>}
          <div className="mt-5 flex justify-end gap-2"><button type="button" disabled={isDeleting} onClick={() => setDeleteTarget(null)} className="h-9 rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button><button type="button" disabled={isDeleting} onClick={() => void confirmDeletePet()} className="h-9 rounded-md bg-[#a33237] px-3 text-xs font-semibold text-white hover:bg-[#85262b] disabled:opacity-50">{isDeleting ? "Deleting…" : "Delete"}</button></div>
        </section>
      </div> : null}
    </main>
  );
}
