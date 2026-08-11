"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader } from "./site-chrome";

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const hideChrome =
    pathname === "/register" ||
    pathname === "/login" ||
    pathname.startsWith("/owner");

  if (hideChrome) {
    return children;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
