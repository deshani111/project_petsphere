"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

function formatPrice(price) {
  if (!price) return "Contact seller";
  const amount = Number(price);
  return Number.isFinite(amount)
    ? `Rs. ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(amount)}`
    : `Rs. ${price}`;
}

function capitalizeFirstLetter(value) {
  if (!value) return value;
  const firstLetterIndex = value.search(/[A-Za-z]/);
  if (firstLetterIndex === -1) return value;
  return `${value.slice(0, firstLetterIndex)}${value[firstLetterIndex].toUpperCase()}${value.slice(firstLetterIndex + 1)}`;
}

function formatListingDate(date) {
  if (!date) return "Recently listed";
  const formattedDate = new Date(date);
  if (Number.isNaN(formattedDate.getTime())) return "Recently listed";
  return `Listed ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(formattedDate)}`;
}

export default function MarketplaceListings() {
  const [listings, setListings] = useState([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    fetch("/api/marketplace/ads")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load listings.");
        return response.json();
      })
      .then((ads) => {
        setListings(ads);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  if (state === "loading") return <p>Loading reviewed listings…</p>;
  if (state === "error") return <p role="alert">Reviewed listings could not be loaded. Please try again.</p>;
  if (!listings.length) return <p>No approved listings are available yet.</p>;

  return (
    <section className={styles.listingGrid} aria-label="Approved pets for sale">
      {listings.map((listing) => {
        const title = capitalizeFirstLetter(listing.petName || listing.title);
        const location = capitalizeFirstLetter(listing.location);

        return (
          <article key={listing.id} className={styles.petCard}>
            <div className={styles.petImage}>
              <Image
                src={listing.image || "/marketplace-cooper.webp"}
                alt={title}
                fill
                sizes="(max-width: 700px) 100vw, (max-width: 980px) 50vw, 33vw"
              />
            </div>
            <div className={styles.petDetails}>
              <div className={styles.nameRow}>
                <h3>{title}</h3>
                <strong>{formatPrice(listing.price)}</strong>
              </div>
              <div className={styles.location}><MapPin size={14} aria-hidden="true" /><span>{location || "Location available on request"}</span></div>
              <p className={styles.petSummary}>{listing.petType || "Pet type not specified"}{listing.breed ? ` · ${listing.breed}` : ""}</p>
              {listing.description ? <p className={styles.description}>{listing.description}</p> : null}
              <div className={styles.cardFooter}>
                <span className={styles.listedDate}><CalendarDays size={13} aria-hidden="true" />{formatListingDate(listing.createdAt)}</span>
                <Link href={`/marketplace/${listing.id}`}>View profile <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
