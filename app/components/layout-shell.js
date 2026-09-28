"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader } from "./site-chrome";

export default function LayoutShell({ children, isAuthenticated }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/register" || pathname === "/login" || pathname === "/verify-email";
  const hideChrome = pathname.startsWith("/sitter");

  if (isAuthPage) {
    return (
      <div className={`auth-layout${pathname === "/register" ? " auth-layout-scroll" : ""}`}>
        <SiteHeader isAuthenticated={isAuthenticated} />
        {children}
      </div>
    );
  }

  if (hideChrome || pathname.startsWith("/owner")) {
    return children;
  }

  return (
    <>
      <SiteHeader isAuthenticated={isAuthenticated} />
      {children}
      <SiteFooter />
    </>
  );
}
