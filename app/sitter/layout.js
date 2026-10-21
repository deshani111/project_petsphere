import Sidebar from "./Sidebar";
import { Bell } from "lucide-react";
import ProfileHeader from "./ProfileHeader";
import styles from "./page.module.css";

export default function SitterLayout({ children }) {
  return (
    <div className={styles.shell}>
      <Sidebar />

      <div className={styles.main}>
        <header className={styles.header}>
          <button className={styles.notification} aria-label="Notifications">
            <Bell size={17} strokeWidth={1.7} />
            <span />
          </button>

          <ProfileHeader />
        </header>

        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
