import Sidebar from "./Sidebar";
import { Bell, ChevronDown } from "lucide-react";
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
