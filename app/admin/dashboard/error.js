"use client";

import styles from "./page.module.css";

export default function AdminDashboardError({ reset }) {
  return (
    <section className={styles.dashboard}>
      <div className={styles.errorState} role="alert">
        <h1>Dashboard unavailable</h1>
        <p>We could not load the dashboard. Please try again.</p>
        <button type="button" onClick={reset}>Try again</button>
      </div>
    </section>
  );
}
