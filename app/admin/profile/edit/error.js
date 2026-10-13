"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function Error({ error, reset }) {
  return (
    <section className={styles.page}>
      <div className={styles.errorBanner} role="alert">
        Unable to load profile information.
      </div>
      <div className={styles.formActions}>
        <Link href="/admin/profile" className={styles.secondaryButton}>Back to Profile</Link>
        <button type="button" className={styles.primaryButton} onClick={reset}>Retry</button>
      </div>
      <p style={{ color: "#8f7876", margin: 0 }}>
        {error?.message || "Please try again."}
      </p>
    </section>
  );
}
