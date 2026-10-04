"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Filter,
  MessageSquare,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Users,
} from "lucide-react";
import styles from "./page.module.css";

const fallback = {
  sitter: { name: "Your reviews", verified: false },
  averageRating: 0,
  totalReviews: 0,
  fiveStarShare: 0,
  ratingCounts: [
    { rating: 5, count: 0 },
    { rating: 4, count: 0 },
    { rating: 3, count: 0 },
    { rating: 2, count: 0 },
    { rating: 1, count: 0 },
  ],
  recent: [],
  highlighted: null,
  reviews: [],
};

export default function SitterReviewsPage() {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    let mounted = true;

    fetch("/api/sitter/reviews")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error || body.message || "Unable to load reviews.");
        }

        return body;
      })
      .then((result) => {
        if (mounted) setData({ ...fallback, ...result });
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Unable to load reviews.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredReviews = useMemo(() => {
    const term = query.trim().toLowerCase();

    return (data.reviews || []).filter((review) => {
      const matchesSearch =
        !term ||
        review.reviewer.toLowerCase().includes(term) ||
        review.pet.name.toLowerCase().includes(term) ||
        review.service.toLowerCase().includes(term) ||
        review.comment.toLowerCase().includes(term);

      const matchesRating = ratingFilter === "all" || Number(review.rating) === Number(ratingFilter);
      return matchesSearch && matchesRating;
    });
  }, [data.reviews, query, ratingFilter]);

  const highlights = [
    {
      label: "Average rating",
      value: data.averageRating ? data.averageRating.toFixed(1) : "0.0",
      detail: `${data.totalReviews} verified reviews`,
      icon: <Star size={14} />,
    },
    {
      label: "Five-star share",
      value: `${data.fiveStarShare}%`,
      detail: "From the latest client feedback",
      icon: <ThumbsUp size={14} />,
    },
    {
      label: "Recent feedback",
      value: data.recent.length.toString().padStart(2, "0"),
      detail: "Newest reviews surfaced first",
      icon: <CalendarDays size={14} />,
    },
    {
      label: "Client trust",
      value: data.sitter.verified ? "Verified" : "Pending",
      detail: data.sitter.verified ? "Trust badge enabled" : "Verification pending",
      icon: <ShieldCheck size={14} />,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topbar}>
          <Link href="/sitter" className={styles.back} aria-label="Back to dashboard">
            <ArrowLeft size={15} />
          </Link>
          <Link href="/sitter/messages" className={styles.editButton}>
            <MessageSquare size={13} />
            Reply to clients
          </Link>
        </div>

        <section className={styles.hero}>
          <div className={styles.heroBody}>
            <div className={styles.kicker}>
              <BadgeCheck size={12} />
              <span>Review center</span>
            </div>
            <h1>{loading ? "Loading your reviews..." : data.sitter.name}</h1>
            <p>
              See what pet owners are saying, track sentiment over time, and use the latest feedback to improve
              your service quality.
            </p>

            <div className={styles.heroMeta}>
              <span>
                <Users size={12} />
                {data.totalReviews} reviews
              </span>
              <span>
                <Star size={12} />
                {data.averageRating ? data.averageRating.toFixed(1) : "0.0"} average
              </span>
              <span>
                <Sparkles size={12} />
                {data.fiveStarShare}% five-star share
              </span>
            </div>
          </div>

          <aside className={styles.heroSide}>
            <div className={styles.scoreCard}>
              <div className={styles.scoreHeader}>
                <small>Review score</small>
                <strong>{data.averageRating ? data.averageRating.toFixed(1) : "0.0"}</strong>
              </div>
              <div className={styles.scoreStars} aria-label={`${data.averageRating || 0} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    fill={index < Math.round(data.averageRating || 0) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <p>{data.totalReviews ? "Your customers are actively reviewing your care quality." : "No reviews yet. Complete a booking to start collecting feedback."}</p>
              <Link href="/sitter/bookings" className={styles.heroLink}>
                Review upcoming bookings
                <ChevronRight size={12} />
              </Link>
            </div>
          </aside>
        </section>

        {error && <p className={styles.error}>{error}</p>}

        <section className={styles.metrics}>
          {highlights.map((item) => (
            <article className={styles.metricCard} key={item.label}>
              <div className={styles.metricHead}>
                <span>{item.label}</span>
                {item.icon}
              </div>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <section className={styles.mainGrid}>
          <div className={styles.leftColumn}>
            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <h2>Rating distribution</h2>
                  <p>Breakdown of customer ratings across all completed reviews.</p>
                </div>
              </div>

              <div className={styles.bars}>
                {data.ratingCounts.map((row) => {
                  const percent = data.totalReviews ? Math.round((row.count / data.totalReviews) * 100) : 0;
                  return (
                    <div className={styles.barRow} key={row.rating}>
                      <span>{row.rating} star</span>
                      <div className={styles.barTrack}>
                        <i style={{ width: `${percent}%` }} />
                      </div>
                      <strong>{row.count}</strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <h2>Latest reviews</h2>
                  <p>Search and filter recent owner feedback.</p>
                </div>
                <div className={styles.filters}>
                  <label className={styles.searchBox}>
                    <Search size={14} />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search reviewer, pet, or service"
                    />
                  </label>
                  <label className={styles.selectBox}>
                    <Filter size={14} />
                    <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
                      <option value="all">All ratings</option>
                      <option value="5">5 stars</option>
                      <option value="4">4 stars</option>
                      <option value="3">3 stars</option>
                      <option value="2">2 stars</option>
                      <option value="1">1 star</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className={styles.reviewList}>
                {filteredReviews.length ? (
                  filteredReviews.map((review) => (
                    <article className={styles.reviewCard} key={review.id}>
                      <div className={styles.reviewTop}>
                        <div className={styles.avatar}>{review.reviewerInitials}</div>
                        <div className={styles.reviewIdentity}>
                          <strong>{review.reviewer}</strong>
                          <small>
                            {review.pet.name} • {review.service}
                          </small>
                        </div>
                        <div className={styles.ratingBadge}>
                          <Star size={11} fill="currentColor" />
                          {review.rating}.0
                        </div>
                      </div>

                      <blockquote>
                        <Quote size={16} />
                        <p>{review.comment || "No written comment provided with this rating."}</p>
                      </blockquote>

                      <div className={styles.reviewFoot}>
                        <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                        {review.bookingId ? (
                          <Link href={`/sitter/bookings/${review.bookingId}`}>View booking</Link>
                        ) : (
                          <span>Booking not linked</span>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <ShieldCheck size={18} />
                    <div>
                      <strong>No reviews match your filters</strong>
                      <p>Try a wider search or clear the rating filter to see all feedback.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className={styles.rightColumn}>
            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <h2>Spotlight review</h2>
                  <p>A representative piece of recent feedback.</p>
                </div>
              </div>

              {data.highlighted ? (
                <div className={styles.spotlight}>
                  <div className={styles.spotlightTop}>
                    <div className={styles.avatar}>{data.highlighted.reviewerInitials}</div>
                    <div>
                      <strong>{data.highlighted.reviewer}</strong>
                      <small>{data.highlighted.pet.name}</small>
                    </div>
                  </div>
                  <div className={styles.spotlightStars}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={12}
                        fill={index < Math.round(data.highlighted.rating) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <p>{data.highlighted.comment || "This review did not include a comment."}</p>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <ShieldCheck size={18} />
                  <div>
                    <strong>No spotlight review yet</strong>
                    <p>Once you receive feedback, the strongest review will appear here.</p>
                  </div>
                </div>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <h2>Quick actions</h2>
                  <p>Helpful places to keep improving your profile.</p>
                </div>
              </div>

              <div className={styles.quickActions}>
                <Link href="/sitter/messages" className={styles.quickCard}>
                  <MessageSquare size={16} />
                  <span>
                    <strong>Reply to owners</strong>
                    <small>Keep conversations active</small>
                  </span>
                </Link>
                <Link href="/sitter/Profile" className={styles.quickCard}>
                  <Users size={16} />
                  <span>
                    <strong>Review profile</strong>
                    <small>Update details and trust signals</small>
                  </span>
                </Link>
                <Link href="/sitter/bookings" className={styles.quickCard}>
                  <CalendarDays size={16} />
                  <span>
                    <strong>Check bookings</strong>
                    <small>Match feedback to completed jobs</small>
                  </span>
                </Link>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}