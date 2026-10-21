"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  EllipsisVertical,
  Filter,
  MessageSquare,
  PawPrint,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";
import styles from "./page.module.css";

const money = (value) =>
  `LKR ${Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
  })}`;

const dateRange = (booking) => {
  if (!booking.startDate) return "Date to be confirmed";
  const format = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
  const start = format.format(new Date(booking.startDate));
  return booking.endDate ? `${start} - ${format.format(new Date(booking.endDate))}` : start;
};

export default function SitterDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/sitter/dashboard", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || body.error || "Unable to load your dashboard.");
        return body;
      })
      .then(setData)
      .catch((cause) => {
        if (cause.name !== "AbortError") setError(cause.message);
      });
    return () => controller.abort();
  }, []);

  const stats = data?.stats;
  const userName = data?.sitter?.name || "Pet Sitter";

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.trusted}><CheckCircle2 size={12} /> Trusted Care Professional</span>
            <h1>Welcome back, {userName}!</h1>
            <p>Everything looks great with your clients today. Manage your services and bookings seamlessly.</p>
            <div className={styles.heroActions}>
              <Link href="/sitter/services" className={styles.primaryButton}><Search size={14} /> Manage Services</Link>
              <Link href="/sitter/bookings" className={styles.secondaryButton}><CalendarDays size={14} /> Manage Bookings</Link>
            </div>
          </div>
        </section>

        {error && <p className={styles.error}>{error}</p>}

        <section aria-label="Dashboard summary" className={styles.stats}>
          <Stat icon={<WalletCards />} label="This month's earnings" tone="rose">
            <strong>{money(stats?.monthEarnings)}</strong>
            <small>Total earned: {money(stats?.totalEarnings)}</small>
          </Stat>
          <Stat icon={<CalendarDays />} label="Active bookings" tone="mint">
            <strong>{stats?.upcoming ?? "—"}</strong>
            <small>Currently active</small>
          </Stat>
          <Stat icon={<ClipboardList />} label="Total bookings" tone="gold">
            <strong>{stats?.totalBookings ?? "—"}</strong>
            <small>All bookings received</small>
          </Stat>
          <Stat icon={<MessageSquare />} label="Unread messages" tone="peach">
            <strong>{stats?.unreadMessages ?? "—"}</strong>
            <small>Need your attention</small>
          </Stat>
        </section>

        <div className={styles.sectionHeading}>
          <div><h2>Your care schedule</h2><p>Keep your client bookings organized and up to date.</p></div>
          <Link href="/sitter/bookings">View all bookings <ArrowRight size={12} /></Link>
        </div>

        <section className={styles.dashboardGrid}>
          <article className={styles.panel}>
            <PanelHeader title="Pending requests" count={stats?.pending ?? 0} href="/sitter/bookings" />
            <div className={styles.pendingGrid}>
              {data?.pending?.length ? data.pending.map((item) => (
                <article className={styles.pendingCard} key={item.id}>
                  <div className={styles.petIcon}><PawPrint size={18} /></div>
                  <div className={styles.pendingBody}>
                    <div className={styles.pendingTitle}>
                      <strong>{item.pet.name}</strong>
                      <span>{item.pet.breed || item.pet.species || "Pet"}</span>
                    </div>
                    <small>Owner: {item.owner.name}</small>
                    <div className={styles.requestMeta}><span><PawPrint size={11} />{item.service}</span><span><CalendarDays size={11} />{dateRange(item)}</span></div>
                  </div>
                  <span className={styles.pendingBadge}>Pending</span>
                </article>
              )) : <EmptyState text="No pending requests right now." />}
            </div>
          </article>

          <aside className={styles.panel}>
            <PanelHeader title="Quick actions" />
            <Quick href="/sitter/messages" icon={<MessageSquare />} title="Messages" text={`${stats?.unreadMessages ?? 0} unread chats`} />
            <Quick href="/sitter/services" icon={<PawPrint />} title="Manage services" text="Update your offerings" />
            <Quick href="/sitter/Profile" icon={<UserRound />} title="My profile" text="Keep your information current" />
          </aside>
        </section>

        <section className={`${styles.panel} ${styles.bookings}`}>
          <PanelHeader title="Upcoming confirmed bookings" href="/sitter/bookings" />
          <div className={styles.tableWrap}>
            <div className={`${styles.bookingRow} ${styles.tableHead}`}>
              <span>Pet &amp; owner</span><span>Service</span><span>Date</span><span>Status</span><span />
            </div>
            {data?.upcomingBookings?.length ? data.upcomingBookings.map((item) => (
              <div className={styles.bookingRow} key={item.id}>
                <div className={styles.petOwner}><span className={styles.smallPet}><PawPrint size={13} /></span><span><strong>{item.pet.name}</strong><small>{item.owner.name}</small></span></div>
                <span>{item.service}</span>
                <span>{dateRange(item)}</span>
                <span className={styles.confirmed}><CheckCircle2 size={12} /> Confirmed</span>
                <Link href={`/sitter/bookings/${item.id}`} aria-label="View booking"><EllipsisVertical size={15} /></Link>
              </div>
            )) : <EmptyState text="No confirmed upcoming bookings." />}
          </div>
          <Link href="/sitter/bookings" className={styles.viewAll}>View all bookings <ArrowRight size={14} /></Link>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, tone, children }) {
  return <article className={`${styles.stat} ${styles[tone]}`}><span className={styles.statIcon}>{icon}</span><div><p>{label}</p>{children}</div></article>;
}

function PanelHeader({ title, count, href }) {
  return <div className={styles.panelHeader}><h2>{title}{count !== undefined && <b>{count}</b>}</h2>{href && <Link href={href}>View all <ArrowRight size={12} /></Link>}</div>;
}

function Quick({ href, icon, title, text }) {
  return <Link href={href} className={styles.quickAction}><span>{icon}</span><div><strong>{title}</strong><small>{text}</small></div><ArrowRight size={14} /></Link>;
}

function EmptyState({ text }) {
  return <div className={styles.empty}><Filter size={16} /><span>{text}</span></div>;
}
