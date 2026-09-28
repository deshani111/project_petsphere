"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/register", label: "Find a Sitter", showActive: false },
  { href: "/register", label: "Become a Sitter", showActive: false },
  { href: "/blog", label: "Blog" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/owner/dashboard", label: "Dashboard" },
];

function isActive(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ isAuthenticated }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);

  return (
    <header
      className={`site-header${menuOpen ? " menu-open" : ""}`}
      id="top"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButton.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setMenuOpen(false);
      }}
    >
      <Link className="brand" href="/" aria-label="PetSphere home">
        <span className="brand-mark">
          <img src="/petsphere-mark.svg" alt="" width="26" height="26" />
        </span>
        <span>
          Pet<span>Sphere</span>
        </span>
      </Link>
      <button
        className="mobile-menu"
        type="button"
        ref={menuButton}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="menu-lines" aria-hidden="true" />
      </button>
      <nav
        className="site-nav"
        id="main-navigation"
        aria-label="Main navigation"
      >
        {navLinks.map((link) => {
          const className =
            link.showActive === false || !isActive(pathname, link.href)
              ? undefined
              : "is-active";
          return (
            <Link
              key={`${link.href}-${link.label}`}
              className={className}
              href={link.href}
              aria-current={className ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="header-actions">
        {isAuthenticated ? (
          <form action="/api/auth/logout" method="post">
            <button className="login-link logout-button" type="submit">
              Logout
            </button>
          </form>
        ) : (
          <>
            <Link className="login-link" href="/login">
              Login
            </Link>
            <Link className="header-cta" href="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <img src="/petsphere-mark.svg" alt="" width="26" height="26" />
          </span>
          <span>
            Pet<span>Sphere</span>
          </span>
        </Link>
        <p>Trusted care for every member of your family.</p>
      </div>
      <div className="footer-column footer-navigation">
        <strong>Navigation</strong>
        <Link href="/">Home</Link>
        <Link href="/about">About Us</Link>
        <Link href="/register">Find a Sitter</Link>
        <Link href="/register">Become a Sitter</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/owner/dashboard">Dashboard</Link>
      </div>
      <small className="footer-copyright">
        &copy; 2024 PetSphere. All rights reserved.
      </small>
    </footer>
  );
}
