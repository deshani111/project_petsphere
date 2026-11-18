"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  PawPrint,
  Star,
} from "lucide-react";
import { developmentBookings } from "./development-bookings";
import styles from "./page.module.css";

const tabs = [
  ["all", "All"],
  ["upcoming", "Upcoming"],
  ["in_progress", "In Progress"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

const serviceIcons = {
  Boarding: "⌂",
  Walking: "✦",
  Grooming: "×",
  Training: "♙",
};

const displayDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const bookingDates = (booking) =>
  booking.end
    ? `${displayDate(booking.start)} – ${displayDate(booking.end)}`
    : displayDate(booking.start);

const titleCase = (value) =>
  value.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AdminBookingsPage() {
  const [tab, setTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [details, setDetails] = useState(null);

  const bookings = useMemo(
    () =>
      developmentBookings
        .filter((booking) => tab === "all" || booking.status === tab)
        .filter((booking) => {
          if (dateFilter === "all") return true;

          const date = new Date(`${booking.start}T00:00:00`);
          const now = new Date();

          if (dateFilter === "today") {
            return date.toDateString() === now.toDateString();
          }

          if (dateFilter === "week") {
            const week = new Date(now);
            week.setDate(now.getDate() - 7);
            return date >= week && date <= now;
          }

          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        }),
    [tab, dateFilter],
  );

  return (
    <section className={styles.page} aria-labelledby="bookings-title">
      <header className={styles.pageHeading}>
        <div>
          <span>BOOKING MANAGEMENT</span>
          <h1 id="bookings-title">Bookings</h1>
          <p>Review sitter services and booking details.</p>
        </div>
        <strong>{developmentBookings.length} bookings</strong>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="group" aria-label="Filter bookings by status">
          {tabs.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              className={tab === value ? styles.activeTab : undefined}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className={styles.dateFilter}>
          <CalendarDays size={16} aria-hidden="true" />
          <span>Date range</span>
          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            aria-label="Filter bookings by date"
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
        </label>
      </div>

      <article className={styles.tableCard} aria-labelledby="booking-list-title">
        <div className={styles.tableHeading}>
          <div>
            <h2 id="booking-list-title">All bookings</h2>
            <span>
              {bookings.length} {bookings.length === 1 ? "record" : "records"}
            </span>
          </div>
          <span className={styles.tableHint}>Booking overview</span>
        </div>
        <div className={styles.tableWrap} role="region" aria-label="Bookings">
          <table>
            <thead>
              <tr>
                <th scope="col">Sitter</th>
                <th scope="col">Service</th>
                <th scope="col">Pet</th>
                <th scope="col">Dates</th>
                <th scope="col">Status</th>
                <th scope="col">Price</th>
                <th className={styles.actionHeading} scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td data-label="Sitter">
                    <div className={styles.sitter}>
                      <span className={styles.avatar} aria-hidden="true">
                        {booking.sitter
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </span>
                      <div className={styles.sitterDetails}>
                        <strong>{booking.sitter}</strong>
                        <small>
                          {booking.id}
                          <span className={styles.mobileDate}>
                            {" · "}{bookingDates(booking)}
                          </span>
                        </small>
                        <span
                          className={styles.rating}
                          aria-label={`Rating ${booking.rating} out of 5`}
                        >
                          <Star size={12} fill="currentColor" aria-hidden="true" />
                          {booking.rating}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Service">
                    <span className={styles.service}>
                      <span
                        className={`${styles.serviceIcon} ${styles[`service${booking.service}`]}`}
                        aria-hidden="true"
                      >
                        {serviceIcons[booking.service]}
                      </span>
                      {booking.service}
                    </span>
                  </td>
                  <td data-label="Pet">
                    <span className={styles.pet}>
                      <PawPrint size={15} aria-hidden="true" />
                      {booking.pet}
                    </span>
                  </td>
                  <td className={styles.dateCell} data-label="Dates">
                    {bookingDates(booking)}
                  </td>
                  <td data-label="Status">
                    <span className={`${styles.status} ${styles[booking.status]}`}>
                      <i aria-hidden="true" />
                      {titleCase(booking.status)}
                    </span>
                  </td>
                  <td data-label="Price">
                    <strong className={styles.price}>
                      Rs. {booking.price.toLocaleString("en-LK")}
                    </strong>
                  </td>
                  <td className={styles.actionCell} data-label="Action">
                    <button
                      type="button"
                      className={styles.viewButton}
                      aria-label={`View booking details for ${booking.id}`}
                      title="View booking details"
                      onClick={() => setDetails(booking)}
                    >
                      <Eye size={16} aria-hidden="true" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!bookings.length && (
            <div className={styles.empty}>
              <CalendarDays size={22} aria-hidden="true" />
              <strong>No bookings found</strong>
              <span>Try choosing another status or date range.</span>
              <button
                type="button"
                onClick={() => {
                  setTab("all");
                  setDateFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <footer className={styles.pagination}>
          <span>
            Showing <strong>{bookings.length ? "1" : "0"}–{bookings.length}</strong> of{" "}
            <strong>{bookings.length}</strong> bookings
          </span>
          {bookings.length > 0 && (
            <nav aria-label="Booking pages">
              <button type="button" disabled aria-label="Previous page">
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.current}
                aria-current="page"
                aria-label="Page 1"
              >
                1
              </button>
              <button type="button" disabled aria-label="Next page">
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </nav>
          )}
        </footer>
      </article>

      {details && (
        <div className={styles.modalBackdrop}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-details-title"
          >
            <span className={styles.modalIcon}>
              <CalendarDays size={19} aria-hidden="true" />
            </span>
            <h2 id="booking-details-title">Booking details</h2>
            <p>
              <strong>{details.id}</strong>
              <br />
              {details.sitter} · {details.service} for {details.pet}
              <br />
              {bookingDates(details)} · Rs.{" "}
              {details.price.toLocaleString("en-LK")}
            </p>
            <p>
              This read-only preview will connect to booking details when that
              API is available.
            </p>
            <button type="button" onClick={() => setDetails(null)}>
              Close
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
