"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./admin-shell.module.css";

function Icon({ children, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard", group: "Manage" },
  { href: "/admin/users", label: "Users", icon: "users", group: "Manage" },
  { href: "/admin/bookings", label: "Bookings", icon: "bookings", group: "Manage" },
  { href: "/admin/pet-marketplace", label: "Pet Marketplace", icon: "marketplace", group: "Manage" },
  { href: "/admin/blogs", label: "Blogs", icon: "blogs", group: "Manage" },
  { href: "/admin/earnings", label: "Earnings", icon: "earnings", group: "Manage" },
  { href: "/admin/reviews", label: "Reviews", icon: "reviews", group: "Manage" },
  { href: "/admin/profile", label: "My Profile", icon: "profile", group: "Account" },
];

const navigationGroups = ["Manage", "Account"];

function getRoleLabel(role) {
  if (!role) return "";

  if (role === "admin") {
    return "System Admin";
  }

  return String(role)
    .replace(/\_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminShell({ admin, children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pendingAds, setPendingAds] = useState(0);

  const menuButtonRef = useRef(null);
  const notificationButtonRef = useRef(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationsActionError, setNotificationsActionError] = useState("");
  const [notificationsActionLoading, setNotificationsActionLoading] = useState(false);
  const [notificationRefresh, setNotificationRefresh] = useState(0);

  const name = admin.fullName || "Admin User";
  const roleLabel = getRoleLabel(admin.role);

  useEffect(() => {
    fetch("/api/admin/ads?status=pending")
      .then((response) => (response.ok ? response.json() : []))
      .then((ads) => setPendingAds(Array.isArray(ads) ? ads.length : 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!menuOpen && !notificationsOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (menuOpen) {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }

        if (notificationsOpen) {
          setNotificationsOpen(false);
          notificationButtonRef.current?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, notificationsOpen]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/admin/notifications");

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        let payload;

        try {
          payload = await response.json();
        } catch {
          throw new Error(
            `Notification service returned an invalid response (HTTP ${response.status}).`
          );
        }

        if (!response.ok) {
          throw new Error(
            payload.message || `Notifications request failed (HTTP ${response.status}).`
          );
        }

        const validNotifications =
          Array.isArray(payload.notifications) &&
          payload.notifications.every(
            (notification) =>
              notification &&
              typeof notification.notification_id === "string" &&
              typeof notification.is_read === "boolean" &&
              typeof notification.created_date === "string"
          );

        if (!validNotifications) {
          throw new Error(
            "Notification service returned data in an unexpected format."
          );
        }

        if (!cancelled) {
          setNotifications(payload.notifications);
        }
      } catch (loadError) {
        if (!cancelled) {
          setNotificationsError(
            loadError instanceof TypeError
              ? "The notification service could not be reached. Check your network and try again."
              : loadError.message || "Notifications could not be loaded."
          );
        }
      } finally {
        if (!cancelled) {
          setNotificationsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [notificationsOpen, notificationRefresh, router]);

  async function markAllNotificationsRead() {
    setNotificationsActionError("");
    setNotificationsActionLoading(true);

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      let payload;

      try {
        payload = await response.json();
      } catch {
        throw new Error(
          `Notification service returned an invalid response (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          payload.message || `Notifications update failed (HTTP ${response.status}).`
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (actionError) {
      setNotificationsActionError(
        actionError instanceof TypeError
          ? "The notification service could not be reached. Check your network and try again."
          : actionError.message || "Notifications could not be updated."
      );
    } finally {
      setNotificationsActionLoading(false);
    }
  }

  function toggleNotifications() {
    setMenuOpen(false);

    if (!notificationsOpen) {
      setNotificationsLoading(true);
      setNotificationsError("");
      setNotificationsActionError("");
    }

    setNotificationsOpen(!notificationsOpen);
  }

  function isActiveRoute(itemHref) {
    if (itemHref === "/admin/pet-marketplace") {
      return (
        pathname === itemHref ||
        pathname.startsWith(`${itemHref}/`) ||
        pathname.startsWith("/admin/marketplace/")
      );
    }

    return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
  }

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      router.replace("/login");
      router.refresh();
    }
  }

  const navigation = (
    <nav id="admin-navigation" className={styles.navigation} aria-label="Admin navigation">
      {navigationGroups.map((group) => (
        <div className={styles.navigationGroup} key={group}>
          <p className={styles.groupLabel}>{group}</p>

          {navigationItems
            .filter((item) => item.group === group)
            .map((item) => {
              const active = isActiveRoute(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={active ? styles.activeLink : undefined}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <span
                    className={active ? styles.activeIcon : undefined}
                    aria-hidden="true"
                  >
                    {Icons[item.icon]}
                  </span>

                  <span
                    className={`${styles.navigationLabel} ${active ? styles.activeLabel : ""}`}
                  >
                    {item.label}
                  </span>

                  {item.label === "Pet Marketplace" && pendingAds > 0 && (
                    <small aria-label={`${pendingAds} pending ads`}>
                      {pendingAds}
                    </small>
                  )}
                </Link>
              );
            })}
        </div>
      ))}
    </nav>
  );

  return (
    <div
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ""} admin-shell`}
    >
      <div className={styles.mobileSidebarBar}>
        <Link
          href="/admin/dashboard"
          aria-label="PetSphere dashboard"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/petsphere-logo.svg"
            alt="PetSphere"
            width={160}
            height={40}
            priority
          />
        </Link>

        <button
          type="button"
          className={styles.mobileMenuButton}
          ref={menuButtonRef}
          aria-controls="admin-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close admin navigation" : "Open admin navigation"}
          onClick={() => {
            setNotificationsOpen(false);
            setMenuOpen((open) => !open);
          }}
        >
          <span className={styles.mobileMenuIcon} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <aside
        className={`${styles.sidebar} ${menuOpen ? styles.menuOpen : ""} ${collapsed ? styles.collapsed : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <Link
            href="/admin/dashboard"
            className={styles.brand}
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/petsphere-logo.svg"
              alt="PetSphere"
              width={180}
              height={45}
              priority
              className={styles.brandLogo}
            />
          </Link>

          <button
            type="button"
            className={styles.collapseButton}
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {navigation}

        <div className={styles.logoutArea}>
          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <span aria-hidden="true">{Icons.logout}</span>
            <span className={styles.navigationLabel}>Logout</span>
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          className={styles.backdrop}
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.headerActions}>
            <div className={styles.notificationWrap}>
              <button
                type="button"
                className={styles.notificationButton}
                ref={notificationButtonRef}
                aria-label={`Notifications${notifications.length ? `, ${unreadNotificationCount} unread` : ""}`}
                aria-controls={
                  notificationsOpen ? "admin-notifications-panel" : undefined
                }
                aria-expanded={notificationsOpen}
                onClick={toggleNotifications}
              >
                {Icons.bell}

                {unreadNotificationCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <section
                  className={styles.notificationPanel}
                  id="admin-notifications-panel"
                  aria-label="Notifications"
                >
                  <div className={styles.notificationPanelHeading}>
                    <strong>Notifications</strong>

                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        disabled={notificationsActionLoading}
                      >
                        {notificationsActionLoading
                          ? "Marking…"
                          : "Mark all read"}
                      </button>
                    )}
                  </div>

                  {notificationsError ? (
                    <div className={styles.notificationMessage} role="alert">
                      <p>{notificationsError}</p>

                      <button
                        type="button"
                        onClick={() => {
                          setNotificationsError("");
                          setNotificationsLoading(true);
                          setNotificationRefresh((value) => value + 1);
                        }}
                      >
                        Try again
                      </button>
                    </div>
                  ) : notificationsLoading ? (
                    <p className={styles.notificationMessage} role="status">
                      Loading notifications…
                    </p>
                  ) : notifications.length ? (
                    <ul className={styles.notificationList}>
                      {notifications.map((notification) => (
                        <li
                          className={
                            notification.is_read
                              ? styles.notificationItem
                              : `${styles.notificationItem} ${styles.notificationUnread}`
                          }
                          key={notification.notification_id}
                        >
                          <span>
                            {notification.message ||
                              "You have a new notification."}
                          </span>

                          <time dateTime={notification.created_date}>
                            {new Intl.DateTimeFormat("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(notification.created_date))}
                          </time>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.notificationMessage}>
                      No notifications yet.
                    </p>
                  )}

                  {notificationsActionError && (
                    <p
                      className={styles.notificationActionError}
                      role="alert"
                    >
                      {notificationsActionError}
                    </p>
                  )}
                </section>
              )}
            </div>

            <i aria-hidden="true" />

            <div className={styles.adminIdentity}>
              <div className={styles.identityText}>
                <strong>{name}</strong>
                {roleLabel && <span>{roleLabel}</span>}
              </div>

              <span className={styles.identityAvatar}>
                {name.slice(0, 1).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <div className={`${styles.pageContent} admin-page-content`}>
          {children}
        </div>
      </main>
    </div>
  );
}