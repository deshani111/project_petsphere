"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [filters, setFilters] = useState({ category: "all", minPrice: "", maxPrice: "", location: "" });
  const [sort, setSort] = useState("newest");

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

  const filteredListings = useMemo(() => {
    const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
    const locationQuery = filters.location.trim().toLowerCase();

    return listings
      .filter((listing) => {
        const categoryMatches = filters.category === "all"
          || (listing.petType || "").toLowerCase() === filters.category;
        const price = listing.price === null ? null : Number(listing.price);
        const minMatches = minPrice === null || (price !== null && Number.isFinite(price) && price >= minPrice);
        const maxMatches = maxPrice === null || (price !== null && Number.isFinite(price) && price <= maxPrice);
        const locationMatches = !locationQuery || (listing.location || "").toLowerCase().includes(locationQuery);
        return categoryMatches && minMatches && maxMatches && locationMatches;
      })
      .sort((left, right) => sort === "price-low"
        ? (Number(left.price) || Number.POSITIVE_INFINITY) - (Number(right.price) || Number.POSITIVE_INFINITY)
        : sort === "price-high"
          ? (Number(right.price) || 0) - (Number(left.price) || 0)
          : new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }, [filters, listings, sort]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setFilters({ category: "all", minPrice: "", maxPrice: "", location: "" });
  }

  if (state === "loading") return <p>Loading reviewed listings…</p>;
  if (state === "error") return <p role="alert">Reviewed listings could not be loaded. Please try again.</p>;

  return (
    <>
      <form className={styles.filters} onSubmit={(event) => event.preventDefault()}>
        <div className={styles.filterTop}><span className={styles.filterTitle}>Refine your search</span><button type="button" onClick={clearFilters}>Clear all</button></div>
        <div className={styles.filterFields}>
          <label>Category<select name="category" aria-label="Filter by category" value={filters.category} onChange={updateFilter}><option value="all">All pets</option><option value="dog">Dogs</option><option value="cat">Cats</option><option value="bird">Birds</option><option value="other">Other</option></select></label>
          <label>Price range<div className={styles.priceFields}><input name="minPrice" type="number" min="0" placeholder="Min" value={filters.minPrice} onChange={updateFilter} /><input name="maxPrice" type="number" min="0" placeholder="Max" value={filters.maxPrice} onChange={updateFilter} /></div></label>
          <label>Location<input name="location" aria-label="Filter by location" placeholder="City or district" value={filters.location} onChange={updateFilter} /></label>
        </div>
      </form>
      <div className={styles.gridHeading}><span>Showing {filteredListings.length} of {listings.length} listings</span><label className={styles.sortControl}><span className={styles.sortLabel}>Sort by</span><select className={styles.sortButton} aria-label="Sort listings" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
      {!listings.length ? <p>No approved listings are available yet.</p> : !filteredListings.length ? <p>No listings match your filters.</p> : <section className={styles.listingGrid} aria-label="Approved pets for sale">
      {filteredListings.map((listing, index) => {
        const title = capitalizeFirstLetter(listing.petName || listing.title);
        const location = capitalizeFirstLetter(listing.location);

        return (
          <article key={listing.id} className={styles.petCard}>
            <div className={styles.petImage}>
              <Image
                src={listing.image || "/marketplace-cooper.webp"}
                alt={title}
                fill
                loading={index === 0 ? "eager" : "lazy"}
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
    </section>}
    </>
  );
}
