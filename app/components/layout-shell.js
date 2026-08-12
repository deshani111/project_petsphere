"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader } from "./site-chrome";

export default function LayoutShell({ children, isAuthenticated }) {
  const pathname = usePathname();
  const hideChrome =
    pathname === "/register" || pathname === "/login" || pathname === "/verify-email";

  if (hideChrome) {
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
