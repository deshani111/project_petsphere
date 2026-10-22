import Sidebar from "./Sidebar";
import { Bell, ChevronDown } from "lucide-react";
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

          <div className={styles.user}>
            <div className={styles.avatar}>SJ</div>
            <span>Sarah Jenkins</span>
            <ChevronDown size={13} />
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
