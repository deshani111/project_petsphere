// app/components/layout-shell.js

"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader } from "./site-chrome";

export default function LayoutShell({
  children,
  isAuthenticated,
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email";

  // Login/register/verification pages
  if (isAuthPage) {
    return (
      <div
        className={`auth-layout${
          pathname === "/register"
            ? " auth-layout-scroll"
            : ""
        }`}
      >
        <SiteHeader isAuthenticated={isAuthenticated} />
        {children}
      </div>
    );
  }

  // Owner pages have their own navigation/layout
  if (pathname.startsWith("/owner")) {
    return <>{children}</>;
  }

  // All normal pages
  return (
    <>
      <SiteHeader isAuthenticated={isAuthenticated} />

      {children}

      <SiteFooter isAuthenticated={isAuthenticated} />
    </>
  );
}