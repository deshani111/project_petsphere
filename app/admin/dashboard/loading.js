import styles from "./page.module.css";

export default function AdminDashboardLoading() {
  return <section className={`admin-dashboard ${styles.dashboard}`} aria-busy="true"><div className={styles.loadingState}>Loading dashboard…</div></section>;
}
