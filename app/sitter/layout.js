"use client";

import Link from "next/link";
import { Bell, ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import styles from "./page.module.css";

function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "PS";
}

export default function SitterLayout({ children }) {
  const [profile, setProfile] = useState(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetch("/api/sitter/profile", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((body) => setProfile(body?.profile || body?.data || null))
      .catch(() => {});
    fetch("/api/sitter/notifications?summary=1", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((body) => setHasUnreadNotifications((body?.unreadCount || 0) > 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutsideClick); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  const name = profile?.fullName || "Your account";
  return <div className={styles.shell}><Sidebar /><div className={styles.main}><header className={styles.header}>
    <Link className={styles.notification} href="/sitter/Profile" aria-label="View profile"><Bell size={18} strokeWidth={1.7} />{hasUnreadNotifications && <span aria-hidden="true" />}</Link>
    <div className={styles.accountMenu} ref={menuRef}><button className={styles.user} type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-haspopup="menu"><span className={styles.avatar}>{profile?.profileImage ? <img src={profile.profileImage} alt="" /> : initials(name)}</span><span>{name}</span><ChevronDown size={15} aria-hidden="true" /></button>{menuOpen && <div className={styles.accountDropdown} role="menu"><Link href="/sitter/Profile" role="menuitem" onClick={() => setMenuOpen(false)}><UserRound size={15} />View profile</Link><Link href="/sitter/Profile/edit" role="menuitem" onClick={() => setMenuOpen(false)}><Settings size={15} />Account settings</Link><button type="button" role="menuitem" onClick={logout}><LogOut size={15} />Log out</button></div>}</div>
  </header><main>{children}</main></div></div>;
}
