"use client";

import Link from "next/link";
import { Clock3, Eye, FilePenLine, Plus, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import StatusBadge from "../../../components/marketplace/status-badge";
import styles from "./my-ads.module.css";

function formatPrice(price) { if (!price) return "Price on request"; const amount = Number(price); return Number.isFinite(amount) ? `Rs. ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(amount)}` : `Rs. ${price}`; }
function formatDate(date) { if (!date) return "Recently created"; const value = new Date(date); return Number.isNaN(value.getTime()) ? "Recently created" : `Created ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value)}`; }

export default function MyAdsClient() {
  const [ads, setAds] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  useEffect(() => { fetch("/api/marketplace/ads/mine").then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then(setAds).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  return <main className={styles.main}><div className={styles.content}>
    <Link href="/marketplace" className={styles.back}><span aria-hidden="true">←</span> Marketplace</Link>
    <header className={styles.hero}><div><span className={styles.eyebrow}>Marketplace dashboard</span><h1>My listings</h1><p>Manage your ads and keep track of every review decision in one place.</p></div><Link href="/marketplace/new" className={styles.create}><Plus size={17} aria-hidden="true" />Post an ad</Link></header>
    {loading ? <div className={styles.loading}>Loading your listings…</div> : null}{error ? <div className={styles.error} role="alert">Could not load your listings. <button type="button" onClick={() => location.reload()}>Try again</button></div> : null}
    {!loading && !error && !ads.length ? <section className={styles.empty}><span><FilePenLine size={28} aria-hidden="true" /></span><h2>Your marketplace starts here</h2><p>Create your first listing to introduce a pet to the right home.</p><Link href="/marketplace/new"><Plus size={16} aria-hidden="true" />Create an ad</Link></section> : null}
    {!loading && !error && ads.length ? <section className={styles.grid} aria-label="Your listings">{ads.map((ad) => <article key={ad.id} className={styles.card}><div className={styles.image}><img src={ad.image || "/marketplace-cooper.webp"} alt="" /></div><div className={styles.cardBody}><div className={styles.cardHeading}><div><span className={styles.date}>{formatDate(ad.createdAt)}</span><h2>{ad.petName || ad.title}</h2></div><strong>{formatPrice(ad.price)}</strong></div><p>{ad.description || "No description added yet."}</p>{ad.status === "rejected" ? <div className={styles.reason}><TriangleAlert size={15} aria-hidden="true" /><span><b>Review note</b>{ad.rejectionReason || "Please review your listing details and submit it again."}</span></div> : null}<div className={styles.actions}><div>{ad.status === "approved" ? <Link href={`/marketplace/${ad.id}`}><Eye size={16} aria-hidden="true" />View listing</Link> : null}{ad.status === "rejected" ? <Link href={`/marketplace/new?edit=${ad.id}`}><FilePenLine size={16} aria-hidden="true" />Edit &amp; resubmit</Link> : null}{ad.status === "pending" ? <span className={styles.reviewing}><Clock3 size={15} aria-hidden="true" />Awaiting review</span> : null}</div><StatusBadge status={ad.status} reason={ad.rejectionReason} /></div></div></article>)}</section> : null}
  </div></main>;
}
