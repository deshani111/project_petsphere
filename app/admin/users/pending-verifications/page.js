"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleDot,
  Clock3,
  Eye,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { developmentVerifications } from "./development-verifications";
import styles from "./page.module.css";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

export default function PendingVerificationsPage() {
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [modal, setModal] = useState(null);
  const dialogCloseRef = useRef(null);
  const returnFocusRef = useRef(null);

  const records = useMemo(
    () =>
      developmentVerifications
        .filter(
          (item) =>
            !search ||
            `${item.name} ${item.id}`.toLowerCase().includes(search.toLowerCase()),
        )
        .filter((item) => status === "all" || item.status === status)
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : sort === "oldest"
              ? new Date(a.applied) - new Date(b.applied)
              : new Date(b.applied) - new Date(a.applied),
        ),
    [search, status, sort],
  );
  const pending = developmentVerifications.filter(
    (item) => item.status === "pending",
  ).length;
  const inReview = developmentVerifications.length - pending;
  const stats = [
    { label: "Pending", value: pending, Icon: Clock3, tone: "pendingTone" },
    { label: "In review", value: inReview, Icon: CircleDot, tone: "reviewTone" },
    {
      label: "Showing",
      value: records.length,
      Icon: Check,
      tone: "showingTone",
    },
  ];

  useEffect(() => {
    if (!modal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogCloseRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setModal(null);
      } else if (event.key === "Tab") {
        event.preventDefault();
        dialogCloseRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [modal]);

  const openModal = (nextModal) => {
    returnFocusRef.current = document.activeElement;
    setModal(nextModal);
  };

  return (
    <section className={styles.page} aria-labelledby="verification-title">
      <Link className={styles.backLink} href="/admin/users">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to users
      </Link>

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Trust &amp; Safety</span>
          </div>
          <h1 id="verification-title">Verification queue</h1>
          <p>Review sitter applications and help keep the PetSphere community safe.</p>
        </div>
        <div className={styles.queueBadge} aria-label={`${developmentVerifications.length} applications in queue`}>
          <span>{developmentVerifications.length}</span>
          <span>in the queue</span>
        </div>
      </header>

      <div className={styles.overview} aria-label="Verification overview">
        {stats.map(({ label, value, Icon, tone }) => (
          <div className={styles.statCard} key={label}>
            <span className={`${styles.statIcon} ${styles[tone]}`}>
              <Icon size={18} aria-hidden="true" />
            </span>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      <form
        className={styles.toolbar}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(draft.trim());
        }}
      >
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className={styles.visuallyHidden}>Search applicant name or ID</span>
          <input
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search applicants by name or ID"
          />
        </label>
        <button className={styles.searchButton} type="submit">
          Search
        </button>
        <label className={styles.filterLabel}>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_review">In review</option>
          </select>
        </label>
        <label className={styles.filterLabel}>
          <span>Sort by</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name</option>
          </select>
        </label>
      </form>

      <article className={styles.tableCard} aria-labelledby="applications-title">
        <div className={styles.cardHeading}>
          <div>
            <h2 id="applications-title">Applications</h2>
            <span>{records.length} {records.length === 1 ? "application" : "applications"}</span>
          </div>
          <span className={styles.sortHint}>
            {sort === "name"
              ? "Sorted by applicant name"
              : sort === "oldest"
                ? "Oldest submissions first"
                : "Newest submissions first"}
          </span>
        </div>
        <div className={styles.tableWrap} role="region" aria-label="Verification applications">
          <table>
            <thead>
              <tr>
                <th scope="col">Applicant</th>
                <th className={styles.submittedColumn} scope="col">Submitted</th>
                <th scope="col">Status</th>
                <th className={styles.actionsHeading} scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const isInReview = record.status === "in_review";
                return (
                  <tr key={record.id}>
                    <td>
                      <div className={styles.person}>
                        <span className={styles.avatar} aria-hidden="true">
                          {record.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </span>
                        <div className={styles.personDetails}>
                          <strong>{record.name}</strong>
                          <small>
                            {record.id}
                            <span className={styles.mobileDate}>
                              {" · "}Submitted {formatDate(record.applied)}
                            </span>
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className={styles.submittedColumn}>
                      {formatDate(record.applied)}
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          isInReview ? styles.inReview : styles.pendingStatus
                        }`}
                      >
                        <span aria-hidden="true" />
                        {isInReview ? "In review" : "Pending"}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actions}>
                        <button
                          className={styles.reviewButton}
                          type="button"
                          onClick={() => openModal({ type: "details", record })}
                        >
                          <Eye size={16} aria-hidden="true" />
                          Review
                        </button>
                        <button
                          className={styles.approve}
                          type="button"
                          aria-label={`Preview approval for ${record.name}`}
                          onClick={() => openModal({ type: "approve", record })}
                        >
                          <Check size={17} aria-hidden="true" />
                        </button>
                        <button
                          className={styles.reject}
                          type="button"
                          aria-label={`Preview rejection for ${record.name}`}
                          onClick={() => openModal({ type: "reject", record })}
                        >
                          <X size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!records.length && (
            <div className={styles.empty}>
              <Search size={22} aria-hidden="true" />
              <strong>No applications found</strong>
              <span>Try changing your search or status filter.</span>
            </div>
          )}
        </div>
        <footer className={styles.pagination}>
          Showing <strong>{records.length}</strong> of{" "}
          <strong>{developmentVerifications.length}</strong> applications
        </footer>
      </article>

      {modal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setModal(null)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-dialog-title"
            aria-describedby="verification-dialog-description"
            onClick={(event) => event.stopPropagation()}
          >
            <span className={styles.modalIcon}>
              {modal.type === "approve" ? (
                <Check size={20} aria-hidden="true" />
              ) : modal.type === "reject" ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Eye size={20} aria-hidden="true" />
              )}
            </span>
            <h2 id="verification-dialog-title">
              {modal.type === "details"
                ? "Application preview"
                : modal.type === "approve"
                  ? "Approval preview"
                  : "Rejection preview"}
            </h2>
            <p id="verification-dialog-description">
              {modal.type === "details"
                ? `${modal.record.name} submitted an application on ${formatDate(modal.record.applied)}.`
                : `This preview does not change ${modal.record.name}'s application.`}
            </p>
            <span className={styles.previewNotice}>
              Review actions are preview-only and are not submitted.
            </span>
            <div className={styles.modalActions}>
              <button
                ref={dialogCloseRef}
                type="button"
                onClick={() => setModal(null)}
              >
                Close preview
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
