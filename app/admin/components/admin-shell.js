"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./admin-shell.module.css";

function Icon({ children, className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

const Icons = {
  dashboard: (
    <Icon className={styles.iconSvg}>
      <rect x="4" y="4" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
    </Icon>
  ),
  users: (
    <Icon className={styles.iconSvg}>
      <path d="M9.2 11.1a3.2 3.2 0 1 0-4.4-3 3.2 3.2 0 0 0 4.4 3Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.8 19.2c.7-2.8 3-4.7 5.9-4.7s5.2 1.9 5.9 4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14.4 12.2a2.7 2.7 0 1 0-3.3-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15.8 19.2c-.3-1.4-1.1-2.6-2.2-3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
  bookings: (
    <Icon className={styles.iconSvg}>
      <rect x="4" y="5" width="16" height="15" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3.8v3.4M16 3.8v3.4M4 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
  marketplace: (
    <Icon className={styles.iconSvg}>
      <path d="M5 9h14l-1 11H6L5 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 9a4 4 0 0 1 8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 12v1.6a3 3 0 1 0 6 0V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
  blogs: (
    <Icon className={styles.iconSvg}>
      <path d="M6 4h10l4 4v12H6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 4v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 10h6M9 14h6M9 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
  earnings: (
    <Icon className={styles.iconSvg}>
      <path d="M4.5 7.5h15a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11.5h8M8 14.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16.2" cy="12.8" r="1.5" stroke="currentColor" strokeWidth="1.8" />
    </Icon>
  ),
  reviews: (
    <Icon className={styles.iconSvg}>
      <path
        d="m12 4.8 1.9 3.9 4.3.6-3.1 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3.1-3 4.3-.6L12 4.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Icon>
  ),
  profile: (
    <Icon className={styles.iconSvg}>
      <path d="M12 12.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.6 19.2c.8-3 3.5-5.2 6.4-5.2s5.6 2.2 6.4 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
  logout: (
    <Icon className={styles.iconSvg}>
      <path d="M9.5 6.3H5.8A1.8 1.8 0 0 0 4 8.1v7.8a1.8 1.8 0 0 0 1.8 1.8h3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m13 8.7 3.2 3.3-3.2 3.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.2 12H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
  bell: (
    <Icon className={styles.iconSvg}>
      <path d="M12 5.2a4.4 4.4 0 0 0-4.4 4.4c0 4.9-1.6 5.6-2.2 6.2h13.2c-.6-.6-2.2-1.3-2.2-6.2A4.4 4.4 0 0 0 12 5.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.8 17.2a2.2 2.2 0 0 0 4.4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
};

const navigationItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/bookings", label: "Bookings", icon: "bookings" },
  { href: "/admin/pet-marketplace", label: "Pet Marketplace", icon: "marketplace" },
  { href: "/admin/blogs", label: "Blogs", icon: "blogs" },
  { href: "/admin/earnings", label: "Earnings", icon: "earnings" },
  { href: "/admin/reviews", label: "Reviews", icon: "reviews" },
  { href: "/admin/profile", label: "My Profile", icon: "profile" },
];

function getRoleLabel(role) {
  if (!role) {
    return "";
  }

  if (role === "admin") {
    return "System Admin";
  }

  return String(role).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminShell({ admin, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = admin.fullName || "Admin User";
  const roleLabel = getRoleLabel(admin.role);

  function isActiveRoute(itemHref) {
    if (itemHref === "/admin/pet-marketplace") {
      return pathname === itemHref || pathname.startsWith(`${itemHref}/`) || pathname.startsWith("/admin/marketplace/");
    }

    return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
  }

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (response.ok) {
      router.replace("/login");
      router.refresh();
    }
  }

  const navigation = (
    <nav className={styles.navigation} aria-label="Admin navigation">
      {navigationItems.map((item) =>
        item.href ? (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className={isActiveRoute(item.href) ? styles.activeLink : undefined}
            aria-current={isActiveRoute(item.href) ? "page" : undefined}
          >
            <span aria-hidden="true">{Icons[item.icon]}</span>
            {item.label}
          </Link>
        ) : (
          <span className={styles.disabledLink} key={item.label} aria-disabled="true">
            <span aria-hidden="true">{Icons[item.icon]}</span>
            {item.label}
          </span>
        ),
      )}
    </nav>
  );

  return (
    <div className={`${styles.shell} admin-shell`}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.menuOpen : ""}`}>
        <Link href="/admin/dashboard" className={styles.brand} onClick={() => setMenuOpen(false)}>
          <span aria-hidden="true">♟</span>
          PetSphere
          <small>Pet Care Platform</small>
        </Link>
        {navigation}
        <button type="button" onClick={handleLogout} className={styles.logoutButton}>
          <span aria-hidden="true">{Icons.logout}</span>
          Logout
        </button>
      </aside>
      {menuOpen && <button className={styles.backdrop} aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>
          <div className={styles.headerActions}>
            <button type="button" className={styles.notificationButton} aria-label="Notifications">
              {Icons.bell}
            </button>
            <i aria-hidden="true" />
            <div className={styles.adminIdentity}>
              <div className={styles.identityText}>
                <strong>{name}</strong>
                {roleLabel && <span>{roleLabel}</span>}
              </div>
              <span className={styles.identityAvatar}>{name.slice(0, 1).toUpperCase()}</span>
            </div>
          </div>
        </header>
        <div className={`${styles.pageContent} admin-page-content`}>{children}</div>
      </main>
    </div>
  );
}
