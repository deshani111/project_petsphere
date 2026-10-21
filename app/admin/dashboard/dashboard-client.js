"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Banknote, CalendarDays, Clock3, RefreshCw, UsersRound } from "lucide-react";
import RevenueChart from "./components/revenue-chart";
import ServiceBookings from "./components/service-bookings";
import SummaryCard from "./components/summary-card";
import styles from "./page.module.css";

const numberFormat = new Intl.NumberFormat("en-US");
const currencyFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const periods = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

function isDashboardPayload(payload) {
  return payload !== null
    && typeof payload === "object"
    && Number.isFinite(payload.totalPetOwners)
    && Number.isFinite(payload.totalPetSitters)
    && Number.isFinite(payload.activeBookings)
    && Number.isFinite(payload.pendingSitterVerifications)
    && Array.isArray(payload.revenue)
    && Array.isArray(payload.bookingsByService)
    && Array.isArray(payload.recentBookings)
    && Array.isArray(payload.pendingSitters);
}

function getPeriodBounds(period, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === "365") {
    start.setDate(1);
    start.setMonth(start.getMonth() - 11);
  } else if (period !== "all") {
    start.setDate(start.getDate() - Number(period) + 1);
  }

  const previousStart = new Date(start);
  if (period === "365") previousStart.setMonth(previousStart.getMonth() - 12);
  else if (period !== "all") previousStart.setDate(previousStart.getDate() - Number(period));
  return { start, previousStart, end: now };
}

function sumPayments(payments) {
  return payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

function getPeriodPayments(payments, period, now = new Date()) {
  if (period === "all") return payments.filter((payment) => new Date(payment.date) <= now);
  const { start, end } = getPeriodBounds(period, now);
  return payments.filter((payment) => {
    const date = new Date(payment.date);
    return date >= start && date <= end;
  });
}

function getPreviousPeriodRevenue(payments, period, now = new Date()) {
  if (period === "all") return null;
  const { start, previousStart } = getPeriodBounds(period, now);
  const previousPayments = payments.filter((payment) => {
    const date = new Date(payment.date);
    return date >= previousStart && date < start;
  });
  if (!previousPayments.length) return null;
  return sumPayments(previousPayments);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(value));
}

export default function AdminDashboardClient({ previewData = null }) {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(previewData);
  const [period, setPeriod] = useState("90");
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(!previewData);

  useEffect(() => {
    if (previewData) return;
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        let payload;
        try {
          payload = await response.json();
        } catch {
          throw new Error(`Dashboard service returned an invalid response (HTTP ${response.status}).`);
        }

        if (!response.ok) throw new Error(payload.message || `Dashboard request failed (HTTP ${response.status}).`);
        if (!isDashboardPayload(payload)) throw new Error("Dashboard service returned data in an unexpected format.");
        if (!cancelled) setDashboard(payload);
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof TypeError
            ? "The dashboard service could not be reached. Check your network and try again."
            : loadError.message || "Dashboard data could not be loaded.";
          setError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [previewData, refresh, router]);

  const retry = () => { setError(""); setDashboard(null); setRefresh((value) => value + 1); };
  const refreshDashboard = () => { setError(""); setRefresh((value) => value + 1); };

  if (error) return <section className={styles.dashboard}><div className={styles.statePanel} role="alert"><h1>Dashboard unavailable</h1><p>{error}</p><button type="button" onClick={retry}>Try again</button></div></section>;
  if (!dashboard) return <section className={styles.dashboard} aria-busy="true"><div className={styles.loadingState}><span className={styles.loadingMark} />Loading platform data</div></section>;

  const payments = dashboard.revenue || [];
  const selectedPayments = getPeriodPayments(payments, period);
  const selectedRevenue = sumPayments(selectedPayments);
  const previousRevenue = getPreviousPeriodRevenue(payments, period);
  const revenueComparison = previousRevenue === null || previousRevenue === 0
    ? null
    : ((selectedRevenue - previousRevenue) / previousRevenue) * 100;
  const monthStart = new Date();
  monthStart.setHours(0, 0, 0, 0);
  monthStart.setDate(1);
  const now = new Date();
  const monthlyRevenue = payments
    .filter((payment) => new Date(payment.date) >= monthStart && new Date(payment.date) <= now)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const totalUsers = (dashboard.totalPetOwners || 0) + (dashboard.totalPetSitters || 0);
  const summary = [
    { label: "Total users", value: numberFormat.format(totalUsers), detail: `${numberFormat.format(dashboard.totalPetOwners || 0)} owners · ${numberFormat.format(dashboard.totalPetSitters || 0)} sitters`, icon: UsersRound },
    { label: "Active bookings", value: numberFormat.format(dashboard.activeBookings || 0), detail: "Pending, confirmed and in progress", icon: CalendarDays },
    { label: "Monthly revenue", value: currencyFormat.format(monthlyRevenue), detail: "Completed payments this month", icon: Banknote, featured: true },
    { label: "Sitter applications", value: numberFormat.format(dashboard.pendingSitterVerifications || 0), detail: "Awaiting verification", icon: BadgeCheck, alert: dashboard.pendingSitterVerifications > 0 },
  ];

  return (
    <section className={styles.dashboard}>
      <header className={styles.pageHeading}>
        <div>
          <div className={styles.eyebrow}><span /> Platform intelligence</div>
          <h1>Welcome back, administrator</h1>
          <p>Your PetSphere operations and performance at a glance.</p>
        </div>
        <div className={styles.headingActions}>
          <div className={styles.snapshot} role="status"><span className={styles.snapshotDot} /><span>Platform data connected</span></div>
          <label className={styles.periodSelect}>
            <span className={styles.visuallyHidden}>Revenue period</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              {periods.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          {!previewData && <button className={styles.refreshButton} type="button" onClick={refreshDashboard} disabled={isLoading} aria-label="Refresh dashboard data" title="Refresh dashboard data">
            <RefreshCw size={15} aria-hidden="true" className={isLoading ? styles.refreshing : undefined} />
            <span>{isLoading ? "Refreshing" : "Refresh"}</span>
          </button>}
        </div>
      </header>

      <div className={styles.summaryGrid}>
        {summary.map((card) => <SummaryCard key={card.label} {...card} />)}
      </div>

      <div className={styles.analyticsGrid}>
        <article className={styles.chartCard}>
          <div className={styles.panelHeading}>
            <div>
              <span className={styles.sectionKicker}>Performance</span>
              <h2>Revenue</h2>
              <p>Completed payments across the selected period</p>
            </div>
          </div>
          <div className={styles.revenueSummary}>
            <strong>{currencyFormat.format(selectedRevenue)}</strong>
            <span>{selectedPayments.length} completed {selectedPayments.length === 1 ? "payment" : "payments"}</span>
            {revenueComparison !== null && <span className={`${styles.comparison} ${revenueComparison >= 0 ? styles.comparisonUp : styles.comparisonDown}`}>
              {revenueComparison >= 0 ? "↑" : "↓"} {Math.abs(revenueComparison).toFixed(1)}% vs previous period
            </span>}
          </div>
          <RevenueChart payments={selectedPayments} period={period} />
        </article>

        <article className={styles.servicesCard}>
          <div className={styles.panelHeading}>
            <div>
              <span className={styles.sectionKicker}>Demand</span>
              <h2>Bookings by service</h2>
              <p>Distribution across listed service categories</p>
            </div>
          </div>
          <ServiceBookings services={dashboard.bookingsByService || []} />
        </article>
      </div>

      <div className={styles.operationsGrid}>
        <article className={styles.bookingsCard}>
          <div className={styles.panelHeading}>
            <div>
              <span className={styles.sectionKicker}>Operations</span>
              <h2>Recent bookings</h2>
            </div>
            <Link className={styles.textLink} href="/admin/bookings">View bookings <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          {dashboard.recentBookings?.length ? (
            <>
              <div className={styles.bookingHead}><span>Booking</span><span>Customer &amp; pet</span><span>Service</span><span>Date</span><span>Status</span></div>
              <div className={styles.bookingList}>
                {dashboard.recentBookings.map((booking) => (
                  <Link className={styles.bookingRow} key={booking.id} href="/admin/bookings" aria-label={`Open booking #${booking.id} in bookings management`}>
                    <span className={styles.bookingRef}>#{booking.id}</span>
                    <span className={styles.bookingCustomer}>
                      {booking.petPhoto ? <Image src={booking.petPhoto} alt="" width={34} height={34} unoptimized /> : <span className={styles.petInitial}>{booking.petName?.slice(0, 1) || "P"}</span>}
                      <span><strong>{booking.petName}</strong><small>{booking.ownerName}</small></span>
                    </span>
                    <span className={styles.bookingService}>{booking.serviceName}</span>
                    <time dateTime={booking.date}>{formatDate(booking.date)}</time>
                    <span className={`${styles.status} ${styles[`status_${booking.status}`] || ""}`}><i />{booking.status.replaceAll("_", " ")}</span>
                  </Link>
                ))}
              </div>
            </>
          ) : <p className={styles.emptyState}>No bookings have been recorded yet.</p>}
        </article>

        <article className={styles.approvalsCard}>
          <div className={styles.panelHeading}>
            <div>
              <span className={styles.sectionKicker}>Needs attention</span>
              <h2>Pending approvals</h2>
            </div>
            <span className={styles.pendingCount}>{numberFormat.format(dashboard.pendingSitterVerifications || 0)}</span>
          </div>
          {dashboard.pendingSitters?.length ? (
            <div className={styles.approvalList}>
              {dashboard.pendingSitters.map((sitter) => (
                <div className={styles.approvalRow} key={sitter.id}>
                  <span className={styles.approvalAvatar}>{sitter.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
                  <span className={styles.approvalPerson}><strong>{sitter.name}</strong><small><Clock3 size={12} aria-hidden="true" /> {sitter.dateLabel || "Submitted"} {formatDate(sitter.submittedAt)}</small><em>Pending verification</em></span>
                </div>
              ))}
              <Link className={styles.approvalLink} href="/admin/users/pending-verifications">Review verification queue <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          ) : <p className={styles.emptyState}>All sitter profiles are verified.</p>}
        </article>
      </div>
    </section>
  );
}
