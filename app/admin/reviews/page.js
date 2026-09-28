"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const pageSize = 8;

function Icon({ name }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 14 14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "search":
      return <svg {...common}><circle cx="6" cy="6" r="3.8" /><path d="m9 9 3 3" /></svg>;
    case "filter":
      return <svg {...common}><path d="M2.2 3h9.6M4.2 7h5.6M5.9 11h2.2" /></svg>;
    case "view":
      return <svg {...common}><path d="M1.4 7s2.1-4 5.6-4 5.6 4 5.6 4-2.1 4-5.6 4S1.4 7 1.4 7Z" /><circle cx="7" cy="7" r="1.8" /></svg>;
    case "trash":
      return <svg {...common}><path d="M2.6 4h8.8" /><path d="M5 4V2.9h4V4" /><path d="M4.4 4.1 4.9 11h4.2l.5-6.9" /><path d="M6.1 6.2v3.3M7.9 6.2v3.3" /></svg>;
    case "close":
      return <svg {...common}><path d="M3 3 11 11M11 3 3 11" /></svg>;
    default:
      return null;
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderStars(rating) {
  const value = Math.max(0, Math.min(5, Number(rating || 0)));
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={index < Math.round(value) ? styles.starFilled : styles.starMuted}>★</span>
  ));
}

export default function AdminReviewsPage() {
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rating, setRating] = useState("all");
  const [sort, setSort] = useState("newest");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalMode, setModalMode] = useState("");

  const loadReviews = async (searchTerm = search, ratingFilter = rating, sortOrder = sort) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (ratingFilter) params.set("rating", ratingFilter);
      if (sortOrder) params.set("sort", sortOrder);

      const response = await fetch(`/api/admin/reviews?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Reviews data could not be loaded.");
      }

      setData(payload);
    } catch (loadError) {
      setError(loadError.message || "Reviews data could not be loaded.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(search, rating, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, rating, sort]);

  const reviews = data?.reviews || [];
  const visibleReviews = useMemo(() => reviews.slice(0, pageSize), [reviews]);
  const displayedCount = Math.min(pageSize, visibleReviews.length);
  const totalReviews = data?.totalReviews || 0;

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(draft.trim());
  };

  const clearFilters = () => {
    setDraft("");
    setSearch("");
    setRating("all");
    setSort("newest");
  };

  const openReview = (review) => {
    setSelectedReview(review);
    setModalMode("view");
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1>User Reviews <span className={styles.countBadge}>{totalReviews}</span></h1>
        </div>
      </header>

      <form className={styles.toolbar} onSubmit={submitSearch}>
        <label className={styles.searchField}>
          <Icon name="search" />
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Search reviews..." />
        </label>
        <button className={styles.searchButton} type="submit">Search</button>
        <button className={styles.filterButton} type="button" onClick={() => setFiltersOpen((open) => !open)}>
          <Icon name="filter" />
          Filter
        </button>
      </form>

      {filtersOpen && (
        <div className={styles.filters}>
          <label>
            Rating
            <select value={rating} onChange={(event) => setRating(event.target.value)}>
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars & up</option>
              <option value="3">3 stars & up</option>
              <option value="2">2 stars & up</option>
            </select>
          </label>
          <label>
            Sort
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="rating_high">Highest rating</option>
              <option value="rating_low">Lowest rating</option>
            </select>
          </label>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      )}

      {error && <div className={styles.errorState} role="alert">{error}</div>}

      {loading && !data ? (
        <div className={styles.loadingState}>Loading reviews…</div>
      ) : (
        <article className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Review ID</th>
                  <th>User</th>
                  <th>Sitter</th>
                  <th>Rating</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleReviews.map((review) => (
                  <tr key={review.id}>
                    <td><span className={styles.reviewId}>{review.reviewId}</span></td>
                    <td>
                      <div className={styles.person}>
                        <span className={styles.avatar}>{initials(review.ownerName)}</span>
                        <strong>{review.ownerName}</strong>
                      </div>
                    </td>
                    <td>
                      <div className={styles.person}>
                        <span className={`${styles.avatar} ${styles.sitterAvatar}`}>{initials(review.sitterName)}</span>
                        <strong>{review.sitterName}</strong>
                      </div>
                    </td>
                    <td>
                      <div className={styles.ratingCell}>
                        <div className={styles.stars}>{renderStars(review.rating)}</div>
                        <span>{review.ratingLabel}</span>
                      </div>
                    </td>
                    <td>{formatDate(review.createdAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button type="button" aria-label={`View ${review.reviewId}`} title="View review" onClick={() => openReview(review)}>
                          <Icon name="view" />
                        </button>
                        <button type="button" aria-label={`Delete ${review.reviewId}`} title="Delete review" onClick={() => { setSelectedReview(review); setModalMode("delete"); }}>
                          <Icon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!visibleReviews.length && (
              <div className={styles.emptyState}>
                <strong>No reviews found</strong>
                <span>Try changing your search or filters.</span>
                <button type="button" onClick={clearFilters}>Clear filters</button>
              </div>
            )}
          </div>

          <footer className={styles.pagination}>
            <span>Showing 1-{displayedCount} of {reviews.length} reviews</span>
            <div>
              <button type="button" disabled aria-label="Previous page">‹</button>
              <button type="button" className={styles.current} aria-current="page">1</button>
              <button type="button" disabled>2</button>
              <button type="button" disabled>3</button>
              <em>…</em>
              <button type="button" disabled>{Math.max(1, Math.ceil(reviews.length / pageSize))}</button>
              <button type="button" disabled aria-label="Next page">›</button>
            </div>
          </footer>
        </article>
      )}

      {selectedReview && (
        <div className={styles.modalBackdrop}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
            <h2 id="review-modal-title">
              {modalMode === "delete" ? "Delete review?" : "Review details"}
            </h2>
            <p>
              {modalMode === "delete"
                ? `This is a UI placeholder for ${selectedReview.reviewId}. No review data will be deleted until a backend action is connected.`
                : `${selectedReview.ownerName} reviewed ${selectedReview.sitterName} for ${selectedReview.serviceType} on ${selectedReview.displayDate}. Rating: ${selectedReview.ratingLabel}/5.`}
            </p>
            <button type="button" onClick={() => { setSelectedReview(null); setModalMode(""); }}>
              <Icon name="close" />
              Close
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
