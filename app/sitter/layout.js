import Sidebar from "./Sidebar";
import { Bell } from "lucide-react";
import ProfileHeader from "./ProfileHeader";
import styles from "./page.module.css";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

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
