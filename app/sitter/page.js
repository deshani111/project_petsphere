"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, ClipboardList, EllipsisVertical, Filter, MessageSquare, PawPrint, Star, UserRound, WalletCards } from "lucide-react";
import styles from "./page.module.css";
const money = (value) => `LKR ${Number(value || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
const dateRange = (booking) => booking.startDate ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(booking.startDate)) + (booking.endDate ? ` - ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(booking.endDate))}` : "") : "Date to be confirmed";
export default function SitterDashboard() {
 const [data, setData] = useState(null); const [error, setError] = useState("");
 useEffect(() => { fetch("/api/sitter/dashboard").then(async r => { const body = await r.json(); if (!r.ok) throw new Error(body.message); setData(body); }).catch(e => setError(e.message)); }, []);
 const stats = data?.stats;
 return <div className={styles.page}><div className={styles.content}>
  <h1 className={styles.title}>Welcome back {data?.sitter?.name || ""}!</h1>
  {data?.sitter?.verified && <div className={styles.verified}><span>✓</span>Verified Professional</div>}
  {error && <p className={styles.error}>{error}</p>}
  <section className={styles.stats}>
   <Stat icon={<WalletCards size={15}/>} label="This Month's Earnings"><div className={styles.earning}><strong>{money(stats?.monthEarnings)}</strong><em>Total: {money(stats?.totalEarnings)}</em></div></Stat>
   <Stat icon={<CalendarDays size={15}/>} label="Upcoming Bookings"><strong>{stats?.upcoming ?? "—"} Confirmed</strong><p>{stats ? `${stats.totalBookings} total bookings` : "Loading bookings..."}</p></Stat>
   <Stat icon={<Star size={15}/>} label="Average Rating"><strong>{stats ? `${stats.averageRating.toFixed(1)} Stars` : "—"}</strong><p>{stats ? `From ${stats.reviewCount} verified reviews` : "Loading reviews..."}</p></Stat>
   <Stat icon={<ClipboardList size={15}/>} label="Active Services"><strong>{stats?.activeServices ?? "—"} Listed</strong><p>{stats ? `${stats.completed} completed · ${stats.cancelled} cancelled` : "Loading services..."}</p></Stat>
  </section>
  <section className={styles.middle}><div className={styles.pendingBlock}><div className={styles.sectionHead}><h2>Pending Requests <b>{stats?.pending ?? 0}</b></h2><Link href="/sitter/bookings">View All</Link></div><div className={styles.pendingGrid}>{data?.pending?.length ? data.pending.map(item => <div className={styles.pendingCard} key={item.id}><div className={styles.petTop}><div className={styles.petImage}>🐾</div><div className={styles.petInfo}><div className={styles.petName}><strong>{item.pet.name}</strong><span>({item.pet.breed || item.pet.species || "Pet"})</span><small>PENDING</small></div><p>Owner: {item.owner.name}</p></div></div><div className={styles.requestInfo}><div><PawPrint size={12}/>{item.service}</div><div><CalendarDays size={12}/>{dateRange(item)}</div></div></div>) : <p className={styles.empty}>No pending requests.</p>}</div></div>
   <div className={styles.quick}><h2>Quick Actions</h2><Quick href="/sitter/messages" icon={<MessageSquare size={15}/>} title="Messages" text={`${stats?.unreadMessages ?? 0} unread chats`}/><Quick href="/sitter/services" icon={<PawPrint size={15}/>} title="Manage Services" text="Update your offerings"/><Quick href="/sitter/Profile" icon={<UserRound size={15}/>} title="My Profile" text="Keep your info current"/></div></section>
  <section className={styles.bookings}><div className={styles.sectionHead}><h2>Upcoming Confirmed Bookings</h2><Link href="/sitter/bookings" className={styles.filter} aria-label="View bookings"><Filter size={13}/></Link></div><div className={styles.table}><div className={`${styles.row} ${styles.tableHead}`}><span>Pet &amp; Owner</span><span>Service</span><span>Date</span><span>Time</span><span>Status</span><span/></div>{data?.upcomingBookings?.length ? data.upcomingBookings.map(item => <div className={styles.row} key={item.id}><div className={styles.ownerPet}><div className={styles.tablePet}>🐾</div><div><strong>{item.pet.name}</strong><small>Owner: {item.owner.name}</small></div></div><span>{item.service}</span><span>{dateRange(item)}</span><span>Details available</span><span className={styles.confirmed}><i/>Confirmed</span><Link href={`/sitter/bookings/${item.id}`} className={styles.more} aria-label="View booking"><EllipsisVertical size={14}/></Link></div>) : <p className={styles.empty}>No confirmed upcoming bookings.</p>}</div></section>
 </div></div>;
}
function Stat({icon,label,children}) { return <div className={styles.stat}><div className={styles.statHead}><span>{label}</span>{icon}</div><div className={styles.statBody}>{children}</div></div>; }
function Quick({href,icon,title,text}) { return <Link href={href} className={styles.quickCard}><span className={styles.quickIcon}>{icon}</span><span><strong>{title}</strong><small>{text}</small></span></Link>; }
