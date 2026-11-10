"use client";

import Link from "next/link";
import { Clock3, Eye, FilePenLine, Plus, Search, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import StatusBadge from "../../../components/marketplace/status-badge";
import styles from "./my-ads.module.css";
import redesign from "./my-ads-redesign.module.css";

function formatPrice(price) { if (!price) return "Price on request"; const amount = Number(price); return Number.isFinite(amount) ? `Rs. ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(amount)}` : `Rs. ${price}`; }
function formatDate(date) { if (!date) return "Recently created"; const value = new Date(date); return Number.isNaN(value.getTime()) ? "Recently created" : `Created ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value)}`; }

export default function MyAdsClient() {
  const [ads, setAds] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false); const [deletingId, setDeletingId] = useState(null); const [deleteFeedback, setDeleteFeedback] = useState(null); const [filter, setFilter] = useState("all");
  useEffect(() => { fetch("/api/marketplace/ads/mine").then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then(setAds).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  async function handleDelete(adId) {
    if (deletingId || !window.confirm("Are you sure you want to delete this ad? This action cannot be undone.")) return;
    setDeletingId(adId); setDeleteFeedback(null);
    try {
      const response = await fetch(`/api/marketplace/ads/${adId}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not delete your ad. Please try again.");
      setAds((currentAds) => currentAds.filter((ad) => ad.id !== adId));
      setDeleteFeedback({ message: result.message || "Your ad was deleted.", error: false });
    } catch (deleteError) {
      setDeleteFeedback({ message: deleteError.message || "Could not delete your ad. Please try again.", error: true });
    } finally {
      setDeletingId(null);
    }
  }
  const counts = ads.reduce((result, ad) => ({ ...result, [ad.status]: (result[ad.status] || 0) + 1 }), { approved: 0, pending: 0, rejected: 0 });
  const visibleAds = filter === "all" ? ads : ads.filter((ad) => ad.status === filter);
  const filters = [{ id: "all", label: "All listings", count: ads.length }, { id: "approved", label: "Live", count: counts.approved }, { id: "pending", label: "In review", count: counts.pending }, { id: "rejected", label: "Needs attention", count: counts.rejected }];
  return <main className={styles.main}><div className={styles.content}>
    <Link href="/marketplace" className={styles.back}><span aria-hidden="true">←</span> Marketplace</Link>
    <header className={styles.hero}><div><span className={styles.eyebrow}>Marketplace dashboard</span><h1 className={redesign.pageTitle}>My ads</h1><p>Manage your ads and keep track of every review decision in one place.</p></div><Link href="/marketplace/new" className={styles.create}><Plus size={17} aria-hidden="true" />Post an ad</Link></header>
    {loading ? <div className={styles.loading}>Loading your listings…</div> : null}{error ? <div className={styles.error} role="alert">Could not load your listings. <button type="button" onClick={() => location.reload()}>Try again</button></div> : null}{deleteFeedback ? <div className={deleteFeedback.error ? styles.feedbackError : styles.feedback} role={deleteFeedback.error ? "alert" : "status"}>{deleteFeedback.message}</div> : null}
    {!loading && !error && ads.length ? <section className={redesign.listings}><div className={redesign.listingsHeader}><div><h2>Your listings</h2><p>{visibleAds.length} {visibleAds.length === 1 ? "listing" : "listings"} shown</p></div><div className={redesign.filterBar} aria-label="Filter listings">{filters.map((item) => <button type="button" key={item.id} className={filter === item.id ? redesign.activeFilter : undefined} onClick={() => setFilter(item.id)}>{item.label}<span>{item.count}</span></button>)}</div></div>{visibleAds.length ? <div className={styles.grid} aria-label="Your listings">{visibleAds.map((ad) => <article key={ad.id} className={`${styles.card} ${redesign.card}`}><div className={styles.image}><img src={ad.image || "/marketplace-cooper.webp"} alt="" /><span><StatusBadge status={ad.status} reason={ad.rejectionReason} /></span></div><div className={styles.cardBody}><div className={styles.cardHeading}><div><span className={styles.date}>{formatDate(ad.createdAt)}</span><h3>{ad.petName || ad.title}</h3></div><strong>{formatPrice(ad.price)}</strong></div><p>{ad.description || "No description added yet."}</p>{ad.status === "rejected" ? <div className={styles.reason}><TriangleAlert size={15} aria-hidden="true" /><span><b>Review note</b>{ad.rejectionReason || "Please review your listing details and submit it again."}</span></div> : null}<div className={`${styles.actions} ${redesign.actions}`}><div className={styles.actionLinks}>{ad.status === "approved" ? <Link href={`/marketplace/${ad.id}`}><Eye size={16} aria-hidden="true" />View listing</Link> : null}{ad.status === "rejected" ? <Link href={`/marketplace/new?edit=${ad.id}`}><FilePenLine size={16} aria-hidden="true" />Edit &amp; resubmit</Link> : null}{ad.status === "pending" ? <span className={styles.reviewing}><Clock3 size={15} aria-hidden="true" />Awaiting review</span> : null}<button type="button" className={`${styles.delete} ${redesign.delete}`} onClick={() => handleDelete(ad.id)} disabled={deletingId !== null} aria-busy={deletingId === ad.id}><Trash2 size={15} aria-hidden="true" />{deletingId === ad.id ? "Deleting…" : "Delete"}</button></div></div></div></article>)}</div> : <div className={redesign.noResults}><Search size={20} aria-hidden="true" /><div><strong>No {filter === "all" ? "listings" : filters.find((item) => item.id === filter)?.label.toLowerCase()} yet</strong><span>Try another filter to see more of your listings.</span></div><button type="button" onClick={() => setFilter("all")}>Show all</button></div>}</section> : null}
    {!loading && !error && !ads.length ? <section className={styles.empty}><span><FilePenLine size={28} aria-hidden="true" /></span><h2>Your marketplace starts here</h2><p>Create your first listing to introduce a pet to the right home.</p><Link href="/marketplace/new"><Plus size={16} aria-hidden="true" />Create an ad</Link></section> : null}
  </div></main>;
}
