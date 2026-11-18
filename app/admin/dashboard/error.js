"use client";

import styles from "./page.module.css";

export default function AdminDashboardError({ retry }) {
  return (
    <section className={`admin-dashboard ${styles.dashboard}`}>
      <div className={styles.statePanel} role="alert">
        <h1>Dashboard unavailable</h1>
        <p>We could not load the dashboard. Please try again.</p>
        <button type="button" onClick={retry}>Try again</button>
      </div>
    </section>
  );
}
