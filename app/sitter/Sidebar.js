"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  PawPrint,
  WalletCards,
  MessageSquare,
  FileText,
  Store,
  Star,
  UserRound,
  LogOut
} from "lucide-react";
import styles from "./sidebar.module.css";

const items = [
  ["Dashboard", "/sitter", LayoutDashboard],
  ["My Bookings", "/sitter/bookings", CalendarDays],
  ["My Services", "/sitter/services", PawPrint],
  ["Earnings", "/sitter/earnings", WalletCards],
  ["Messages", "/sitter/messages", MessageSquare],
  ["Blogs", "/sitter/blogs", FileText],
  ["Marketplace", "/sitter/marketplace", Store],
  ["Reviews", "/sitter/reviews", Star],
  ["My Profile", "/sitter/Profile", UserRound],
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <Link href="/sitter" className={styles.brand}>
        <div className={styles.brandRow}>
          <PawPrint size={20} fill="currentColor" strokeWidth={1.5} />
          <span>PetSphere</span>
        </div>
        <div className={styles.tagline}>PET CARE PLATFORM</div>
      </Link>

      <nav className={styles.nav}>
        {items.map(([label, href, Icon]) => {
          const active =
            href === "/sitter"
              ? pathname === "/sitter"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${active ? styles.active : ""}`}
            >
              <Icon size={15} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.logoutArea}>
        <button className={styles.logout}>
          <LogOut size={15} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
