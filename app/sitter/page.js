"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Check, CheckCircle2, ChevronRight, ClipboardList, MessageSquare, PawPrint, Search, Star, UserRound, WalletCards, X } from "lucide-react";
import { ModalDialog } from "../../components/shared/modal-dialog";
import { Skeleton, SkeletonCard, SkeletonTable } from "../../components/shared/skeleton";
import styles from "./page.module.css";

const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-LK", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "Date to be confirmed";
const dateRange = (booking) => booking.startDate ? `${formatDate(booking.startDate)}${booking.endDate ? ` – ${formatDate(booking.endDate)}` : ""}` : "Date to be confirmed";
const statusLabel = (status) => String(status || "").replace("_", " ");

function PetAvatar({ pet }) {
  return pet?.photo ? <img className={styles.petPhoto} src={pet.photo} alt={`${pet.name} profile`} /> : <span className={styles.petFallback} aria-label={`${pet?.name || "Pet"} has no profile photo`} role="img"><PawPrint size={16} /></span>;
}

function DashboardSkeleton() {
  return <div className={styles.page} aria-busy="true" aria-label="Loading dashboard"><div className={styles.content}><div className={styles.dashboardLoading}><Skeleton width="min(20rem, 72%)" height="2.2rem" /><Skeleton width="8rem" /><div className={styles.stats}>{Array.from({ length: 4 }, (_, index) => <SkeletonCard image={false} key={index} />)}</div><div className={styles.middle}><SkeletonCard image={false} /><SkeletonCard image={false} /></div><SkeletonTable rows={4} columns={6} /></div></div></div>;
}

export default function SitterDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [declining, setDeclining] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/sitter/dashboard", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || "Unable to load your dashboard.");
        return body;
      })
      .then((body) => {
        setData(body);
        setError("");
      })
      .catch((cause) => {
        if (cause.name !== "AbortError") setError(cause.message || "Unable to load your dashboard.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  function retryDashboard() {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }

  async function decideRequest(booking, status) {
    if (!booking || processingId) return;
    setProcessingId(booking.id);
    setFeedback("");
    setError("");
    try {
      const response = await fetch(`/api/sitter/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "This request could not be updated.");
      setFeedback(status === "confirmed" ? "Booking request accepted." : "Booking request declined.");
      setDeclining(null);
      setLoading(true);
      setReloadKey((key) => key + 1);
    } catch (actionError) {
      setError(actionError.message || "This request could not be updated. Please try again.");
    } finally {
      setProcessingId("");
    }
  }

  if (loading && !data) return <DashboardSkeleton />;
  if (!data) return <div className={styles.page}><div className={styles.content}><section className={styles.errorState} role="alert"><h1>Dashboard unavailable</h1><p>{error || "We could not load your dashboard."}</p><button type="button" onClick={retryDashboard} disabled={loading}>{loading ? "Retrying…" : "Retry"}</button></section></div></div>;

  const stats = data.stats;
  const pendingRequest = data.pending?.find((booking) => booking.id === declining) || null;

  return <div className={styles.page}><div className={styles.content} aria-busy={loading}>
    <section className={styles.welcomeHero}>
      <div>
        <span className={styles.welcomeBadge}><CheckCircle2 size={13} />{data.sitter?.verified ? "Verified Professional" : "Sitter Dashboard"}</span>
        <h1>Welcome back, {data.sitter?.name || "Pet Sitter"}!</h1>
        <p>Keep your bookings, services, and client care up to date.</p>
        <div className={styles.welcomeActions}>
          <Link href="/sitter/services" className={styles.heroPrimary}><Search size={14} />Manage Services</Link>
          <Link href="/sitter/bookings" className={styles.heroSecondary}><CalendarDays size={14} />Manage Bookings</Link>
        </div>
      </div>
    </section>
    {feedback && <p className={styles.feedback} role="status">{feedback}</p>}
    {error && <div className={styles.inlineError} role="alert"><span>{error}</span><button type="button" onClick={retryDashboard} disabled={loading}>Retry</button></div>}

    <section className={styles.stats} aria-label="Dashboard statistics">
      <Stat icon={<WalletCards size={18} />} label="This Month's Earnings"><div className={styles.earning}><strong>{money(stats.monthEarnings)}</strong><em>Total: {money(stats.totalEarnings)}</em></div></Stat>
      <Stat icon={<CalendarDays size={18} />} label="Upcoming Bookings"><strong>{stats.upcoming} confirmed</strong><p>{stats.totalBookings} total bookings</p></Stat>
      <Stat icon={<Star size={18} />} label="Average Rating"><strong>{stats.averageRating.toFixed(1)} stars</strong><p>From {stats.reviewCount} verified reviews</p></Stat>
      <Stat icon={<ClipboardList size={18} />} label="Active Services"><strong>{stats.activeServices} listed</strong><p>{stats.completed} completed · {stats.cancelled} cancelled</p></Stat>
    </section>

    <section className={styles.middle}><div className={styles.pendingBlock}><div className={styles.sectionHead}><h2>Pending Requests <b>{stats.pending}</b></h2><Link href="/sitter/bookings">View all</Link></div><div className={styles.pendingGrid}>{data.pending?.length ? data.pending.map((booking) => <article className={styles.pendingCard} key={booking.id}><div className={styles.petTop}><PetAvatar pet={booking.pet} /><div className={styles.petInfo}><div className={styles.petName}><strong>{booking.pet.name}</strong><span>({booking.pet.breed || booking.pet.species || "Pet"})</span><small>Pending</small></div><p>Owner: {booking.owner.name}</p></div></div><div className={styles.requestInfo}><div><PawPrint size={14} />{booking.service}</div><div><CalendarDays size={14} />{dateRange(booking)}</div></div><div className={styles.requestActions}><button type="button" className={styles.acceptButton} onClick={() => decideRequest(booking, "confirmed")} disabled={Boolean(processingId)}>{processingId === booking.id ? "Updating…" : <><Check size={15} />Accept</>}</button><button type="button" className={styles.declineButton} onClick={() => setDeclining(booking.id)} disabled={Boolean(processingId)}><X size={15} />Decline</button></div></article>) : <p className={styles.empty}>No pending requests right now.</p>}</div></div>
      <aside className={styles.quick}><h2>Quick Actions</h2><Quick href="/sitter/messages" icon={<MessageSquare size={17} />} title="Messages" text={`${stats.unreadMessages} unread chats`} /><Quick href="/sitter/services" icon={<PawPrint size={17} />} title="Manage Services" text="Update your offerings" /><Quick href="/sitter/Profile" icon={<UserRound size={17} />} title="My Profile" text="Keep your info current" /></aside></section>

    <section className={styles.bookings}><div className={styles.sectionHead}><div><h2>Upcoming Bookings</h2><p className={styles.sectionNote}>Showing the next {data.upcomingBookings.length} of {stats.upcoming} confirmed bookings.</p></div><Link href="/sitter/bookings" className={styles.viewAll}>View all bookings <ChevronRight size={15} /></Link></div>
      {data.upcomingBookings.length ? <><div className={styles.table}><div className={`${styles.row} ${styles.tableHead}`}><span>Pet &amp; Owner</span><span>Service</span><span>Date</span><span>Time</span><span>Status</span><span>Details</span></div>{data.upcomingBookings.map((booking) => <div className={styles.row} key={booking.id}><div className={styles.ownerPet}><PetAvatar pet={booking.pet} /><div><strong>{booking.pet.name}</strong><small>Owner: {booking.owner.name}</small></div></div><span>{booking.service}</span><span>{dateRange(booking)}</span><span>{booking.startTime || "Time not specified"}</span><span className={styles.confirmed}><i />{statusLabel(booking.status)}</span><Link href={`/sitter/bookings/${booking.id}`} className={styles.more}>View</Link></div>)}</div><div className={styles.mobileBookings}>{data.upcomingBookings.map((booking) => <article className={styles.bookingCard} key={booking.id}><div className={styles.bookingCardHead}><div className={styles.ownerPet}><PetAvatar pet={booking.pet} /><div><strong>{booking.pet.name}</strong><small>Owner: {booking.owner.name}</small></div></div><span className={styles.confirmed}><i />{statusLabel(booking.status)}</span></div><dl><div><dt>Service</dt><dd>{booking.service}</dd></div><div><dt>Date</dt><dd>{dateRange(booking)}</dd></div><div><dt>Time</dt><dd>{booking.startTime || "Time not specified"}</dd></div></dl><Link href={`/sitter/bookings/${booking.id}`} className={styles.bookingDetails}>View booking details <ChevronRight size={15} /></Link></article>)}</div></> : <p className={styles.empty}>No upcoming confirmed bookings.</p>}
    </section>
  </div>
  <ModalDialog open={Boolean(pendingRequest)} title="Decline booking request" onClose={() => !processingId && setDeclining(null)}><p className={styles.dialogText}>Decline the request for {pendingRequest?.pet.name}? The pet owner will be notified and this cannot be undone.</p><div className={styles.dialogActions}><button type="button" className={styles.declineButton} onClick={() => decideRequest(pendingRequest, "rejected")} disabled={Boolean(processingId)}>{processingId ? "Declining…" : "Decline request"}</button><button type="button" className={styles.dialogCancel} onClick={() => setDeclining(null)} disabled={Boolean(processingId)}>Keep request</button></div></ModalDialog>
  </div>;
}

function Stat({ icon, label, children }) { return <article className={styles.stat}><div className={styles.statHead}><span>{label}</span>{icon}</div><div className={styles.statBody}>{children}</div></article>; }
function Quick({ href, icon, title, text }) { return <Link href={href} className={styles.quickCard}><span className={styles.quickIcon}>{icon}</span><span><strong>{title}</strong><small>{text}</small></span></Link>; }
