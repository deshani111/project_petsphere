"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./pending-ad-approvals.module.css";

function Icon({ name, size = 14 }) {
  const paths = { check: <path d="m5 12 4 4L19 6" />, reject: <><circle cx="12" cy="12" r="8" /><path d="m9 9 6 6m0-6-6 6" /></>, back: <path d="m15 18-6-6 6-6M9 12h12" />, pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></> };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function PendingAdCard({ ad, onAction, processing }) {
  return <article className={styles.card}><div className={styles.imageArea}><img src={ad.image || "/marketplace-cooper.webp"} alt="" /></div><div className={styles.cardBody}><h2>{ad.petName || ad.title}</h2><p className={styles.submitted}>{new Date(ad.createdAt).toLocaleDateString()}</p><div className={styles.meta}><span><Icon name="pin" size={11} />Marketplace</span><strong>{ad.price ? `Rs. ${ad.price}` : "Contact seller"}</strong></div><div className={styles.seller}><span className={styles.sellerAvatar}>{ad.seller?.split(" ").map((part) => part[0]).join("")}</span><span><strong>{ad.seller}</strong><small>{ad.sellerRole === "pet_sitter" ? "Pet Sitter" : "Pet Owner"}</small></span></div><div className={styles.cardActions}><button type="button" className={styles.approve} disabled={processing} onClick={() => onAction("approve", ad)}><Icon name="check" size={12} />Approve</button><button type="button" className={styles.reject} disabled={processing} onClick={() => onAction("reject", ad)}><Icon name="reject" size={12} />Reject</button></div></div></article>;
}

export default function PendingAdApprovals() {
  const [ads, setAds] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false); const [dialog, setDialog] = useState(null); const [reason, setReason] = useState(""); const [processing, setProcessing] = useState(false); const [notice, setNotice] = useState("");
  const load = () => { setLoading(true); setError(false); fetch("/api/admin/ads?status=pending").then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then(setAds).catch(() => setError(true)).finally(() => setLoading(false)); };
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/ads?status=pending").then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then((data) => { if (!cancelled) setAds(data); }).catch(() => { if (!cancelled) setError(true); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const closeDialog = () => { if (!processing) { setDialog(null); setReason(""); } };
  const confirm = async () => { if (dialog.type === "reject" && !reason.trim()) return; setProcessing(true); try { const endpoint = `/api/admin/ads/${dialog.ad.id}/${dialog.type}`; const response = await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: dialog.type === "reject" ? JSON.stringify({ reason: reason.trim() }) : undefined }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message); setAds((current) => current.filter((ad) => ad.id !== dialog.ad.id)); setNotice(payload.message); closeDialog(); } catch (actionError) { setNotice(actionError.message || "Could not update this ad."); } finally { setProcessing(false); } };
  return <section className={styles.page}><header className={styles.heading}><Link href="/admin/marketplace" aria-label="Back to posted ads"><Icon name="back" size={19} /></Link><h1>Pending Ad Approvals</h1><span>{ads.length} Pending</span></header>{notice && <div className={styles.notice} role="status">{notice}</div>}{loading && <div className={styles.state}><strong>Loading pending ads…</strong></div>}{error && <div className={styles.state}><strong>Pending ads could not be loaded.</strong><button type="button" onClick={load}>Retry</button></div>}{!loading && !error && !ads.length && <div className={styles.state}><strong>No ads are waiting for approval.</strong></div>}{!loading && !error && !!ads.length && <div className={styles.grid}>{ads.map((ad) => <PendingAdCard key={ad.id} ad={ad} processing={processing} onAction={(type, item) => setDialog({ type, ad: item })} />)}</div>}{dialog && <div className={styles.backdrop}><section className={styles.dialog} role="dialog" aria-modal="true"><h2>{dialog.type === "approve" ? "Approve this ad?" : "Reject this ad?"}</h2><p>{dialog.type === "approve" ? "This approval will publish the ad." : "A rejection reason is required."}</p>{dialog.type === "reject" && <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Rejection reason" required />}<div><button type="button" disabled={processing} onClick={closeDialog}>Cancel</button><button type="button" disabled={processing || (dialog.type === "reject" && !reason.trim())} onClick={confirm}>{dialog.type === "approve" ? "Approve" : "Reject"}</button></div></section></div>}</section>;
}
