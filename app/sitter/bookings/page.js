"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CircleCheck,
  Clock3,
  PawPrint,
  Play,
  UserRound,
  X,
} from "lucide-react";
import styles from "./page.module.css";

const filters = [
  ["all", "All bookings"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["in_progress", "In progress"],
  ["completed", "Completed"],
];

const statusLabel = (status) => String(status || "").replace("_", " ");
const formatDate = (value) => value
  ? new Intl.DateTimeFormat("en-LK", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value))
  : "Date to be confirmed";

function BookingStatus({ status }) {
  return <span className={`${styles.status} ${styles[`status${status}`] || ""}`}><i />{statusLabel(status)}</span>;
}

function BookingActions({ booking, onUpdate, busy }) {
  if (booking.status === "pending") {
    return <div className={styles.actions}>
      <button type="button" className={styles.accept} onClick={() => onUpdate(booking.id, "confirmed")} disabled={busy}><Check size={15} />{busy ? "Updating" : "Accept"}</button>
      <button type="button" className={styles.decline} onClick={() => onUpdate(booking.id, "rejected")} disabled={busy}><X size={15} />Decline</button>
    </div>;
  }
  if (booking.status === "confirmed") {
    return <button type="button" className={styles.primaryAction} onClick={() => onUpdate(booking.id, "in_progress")} disabled={busy}><Play size={14} />Start service</button>;
  }
  if (booking.status === "in_progress") {
    return <button type="button" className={styles.primaryAction} onClick={() => onUpdate(booking.id, "completed")} disabled={busy}><CircleCheck size={14} />Mark complete</button>;
  }
  return null;
}

function BookingCard({ booking, onUpdate, busy }) {
  const date = booking.startDate
    ? `${formatDate(booking.startDate)}${booking.endDate ? ` – ${formatDate(booking.endDate)}` : ""}`
    : "Date to be confirmed";

  return <article className={styles.bookingCard}>
    <div className={styles.cardTop}>
      <div className={styles.petIdentity}>
        <span className={styles.petAvatar}><PawPrint size={20} /></span>
        <div><h2>{booking.pet.name}</h2><p>{booking.pet.breed || booking.pet.species || "Pet"}</p></div>
      </div>
      <BookingStatus status={booking.status} />
    </div>
    <div className={styles.owner}><UserRound size={14} /><span>Owner</span><strong>{booking.owner.name}</strong></div>
    <div className={styles.details}>
      <div><span className={styles.detailIcon}><PawPrint size={15} /></span><small>Service</small><strong>{booking.service}</strong></div>
      <div><span className={styles.detailIcon}><CalendarDays size={15} /></span><small>Date</small><strong>{date}</strong></div>
      {booking.startTime && <div><span className={styles.detailIcon}><Clock3 size={15} /></span><small>Time</small><strong>{booking.startTime}</strong></div>}
    </div>
    <div className={styles.cardFooter}>
      <BookingActions booking={booking} onUpdate={onUpdate} busy={busy} />
      <Link href={`/sitter/bookings/${booking.id}`} className={styles.detailsLink}>View details <span aria-hidden="true">→</span></Link>
    </div>
  </article>;
}

function AccessState({ onRetry }) {
  return <section className={styles.accessState} role="alert">
    <span className={styles.accessIcon}><UserRound size={23} /></span>
    <h2>Sign in to view your bookings</h2>
    <p>Your sitter account is required to manage requests, upcoming care, and completed bookings.</p>
    <div className={styles.accessActions}><Link href="/login" className={styles.primaryAction}>Sign in</Link><button type="button" className={styles.secondaryAction} onClick={onRetry}>Try again</button></div>
  </section>;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [authRequired, setAuthRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  async function fetchBookings() {
    const response = await fetch("/api/sitter/bookings", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) {
      const requestError = new Error(body.message || "Unable to load bookings.");
      requestError.status = response.status;
      throw requestError;
    }
    return body.bookings || [];
  }

  async function load() {
    setLoading(true);
    try {
      setBookings(await fetchBookings());
      setError("");
      setAuthRequired(false);
    } catch (loadError) {
      setAuthRequired(loadError.status === 401);
      setError(loadError.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetchBookings()
      .then((nextBookings) => { if (active) { setBookings(nextBookings); setAuthRequired(false); } })
      .catch((loadError) => { if (active) { setAuthRequired(loadError.status === 401); setError(loadError.message || "Unable to load bookings."); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function update(id, status) {
    setBusyId(id);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/sitter/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await response.json();
      if (!response.ok) {
        const updateError = new Error(body.message || "Booking could not be updated.");
        updateError.status = response.status;
        throw updateError;
      }
      setMessage(body.message || `Booking ${statusLabel(status)}.`);
      await load();
    } catch (updateError) {
      setAuthRequired(updateError.status === 401);
      setError(updateError.message || "Booking could not be updated.");
    } finally {
      setBusyId("");
    }
  }

  const counts = useMemo(() => bookings.reduce((result, booking) => {
    result[booking.status] = (result[booking.status] || 0) + 1;
    result.all += 1;
    return result;
  }, { all: 0 }), [bookings]);
  const visibleBookings = filter === "all" ? bookings : bookings.filter((booking) => booking.status === filter);

  return <div className={styles.page}><div className={styles.content}>
    <header className={styles.hero}>
      <div><p className={styles.eyebrow}>Care schedule</p><h1>My bookings</h1><p className={styles.subtitle}>Your care calendar, thoughtfully organized.</p></div>
      <div className={styles.heroMark}><CalendarDays size={34} strokeWidth={1.5} /><span>{counts.confirmed || 0} upcoming</span></div>
    </header>

    {authRequired ? <AccessState onRetry={load} /> : error ? <section className={styles.errorState} role="alert"><span className={styles.accessIcon}><CalendarDays size={23} /></span><h2>Bookings are temporarily unavailable</h2><p>{error}</p><button type="button" className={styles.secondaryAction} onClick={load}>Try again</button></section> : <>
      <section className={styles.summary} aria-label="Booking summary">
        <div><span>Total bookings</span><strong>{counts.all}</strong></div>
        <div><span>Needs your response</span><strong>{counts.pending || 0}</strong></div>
        <div><span>In progress</span><strong>{counts.in_progress || 0}</strong></div>
        <div><span>Completed</span><strong>{counts.completed || 0}</strong></div>
      </section>

      <div className={styles.toolbar}><div className={styles.filters} role="group" aria-label="Filter bookings">{filters.map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} className={filter === value ? styles.activeFilter : ""} onClick={() => setFilter(value)}>{label}<b>{counts[value] || 0}</b></button>)}</div><span className={styles.resultCount}>{visibleBookings.length} {visibleBookings.length === 1 ? "booking" : "bookings"}</span></div>

      {message && <p className={styles.message} role="status">{message}</p>}
      {loading ? <div className={styles.loadingGrid} aria-busy="true" aria-label="Loading bookings">{[1, 2, 3].map((item) => <div className={styles.skeletonCard} key={item} />)}</div>
        : visibleBookings.length ? <div className={styles.bookingGrid}>{visibleBookings.map((booking) => <BookingCard key={booking.id} booking={booking} onUpdate={update} busy={busyId === booking.id} />)}</div>
        : <section className={styles.empty}><span className={styles.emptyIcon}><CalendarDays size={24} /></span><h2>{filter === "all" ? "No bookings yet" : `No ${statusLabel(filter)} bookings`}</h2><p>{filter === "all" ? "New booking requests will appear here when an owner chooses your services." : "Try another filter to see more of your care schedule."}</p>{filter !== "all" && <button type="button" onClick={() => setFilter("all")}>View all bookings</button>}</section>}
    </>}
  </div></div>;
}
