"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/#services", label: "Find a Sitter" },
  { href: "/#services", label: "Become a Sitter" },
  { href: "/blog", label: "Blog" },
  { href: "/marketplace", label: "Marketplace" },
];

function PawIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12.2 13.5c-2.1-2.6-6.7.5-4.7 3.8.9 1.5 3.8 1.2 4.7-.5.9 1.7 3.8 2 4.7.5 2-3.3-2.6-6.4-4.7-3.8Z" fill="currentColor" />
      <ellipse cx="5.9" cy="9.2" rx="1.9" ry="2.4" transform="rotate(-28 5.9 9.2)" fill="currentColor" />
      <ellipse cx="9.9" cy="6.4" rx="1.7" ry="2.3" transform="rotate(-10 9.9 6.4)" fill="currentColor" />
      <ellipse cx="14.5" cy="6.4" rx="1.7" ry="2.3" transform="rotate(10 14.5 6.4)" fill="currentColor" />
      <ellipse cx="18.5" cy="9.2" rx="1.9" ry="2.4" transform="rotate(28 18.5 9.2)" fill="currentColor" />
    </svg>
  );
}

function isActive(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ isAuthenticated }) {
  const pathname = usePathname();
  const showDashboardAction = pathname === "/" && isAuthenticated;
  const isHomePage = pathname === "/";

  return (
    <header className={`site-header${isHomePage ? " site-header-home" : ""}`} id="top">
      <Link className="brand" href="/" aria-label="PetSphere home">
        <span className="brand-mark">
          <PawIcon />
        </span>
        <span>
          Pet<span>Sphere</span>
        </span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        {navLinks.map((link) => {
          const className =
            link.href.startsWith("/#") || !isActive(pathname, link.href) ? undefined : "is-active";
          return (
            <Link key={`${link.href}-${link.label}`} className={className} href={link.href}>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="header-actions">
        {showDashboardAction ? (
          <Link className="header-cta" href="/dashboard">
            Dashboard
          </Link>
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
      <Link className="mobile-menu" href="/#services" aria-label="Open menu">
        &#9776;
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <PawIcon />
          </span>
          <span>
            Pet<span>Sphere</span>
          </span>
        </Link>
        <p>Trusted care for every member of your family.</p>
        <small>&copy; 2024 PetSphere. All rights reserved.</small>
      </div>
      <div className="footer-column footer-navigation">
        <strong>Navigation</strong>
        <Link href="/">Home</Link>
        <Link href="/about">About Us</Link>
        <Link href="/#services">Find a Sitter</Link>
        <Link href="/#services">Become a Sitter</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/marketplace">Marketplace</Link>
      </div>
      <div className="footer-column footer-contact">
        <strong>Stay in the loop</strong>
        <p>Get helpful pet care tips in your inbox.</p>
        <div className="footer-email">
          <span>Your email</span>
          <button type="button">&rarr;</button>
        </div>
      </div>
    </footer>
  );
}
