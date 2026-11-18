import { SkeletonPage } from "../../../components/shared/skeleton";

<<<<<<< HEAD
export default function AdminDashboardLoading() {
  return <section className={`admin-dashboard ${styles.dashboard}`} aria-busy="true"><div className={styles.loadingState}>Loading dashboard…</div></section>;
}
=======
export default function AdminDashboardLoading() { return <SkeletonPage variant="dashboard" />; }
>>>>>>> origin/main
