
"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader } from "./site-chrome";

export default function LayoutShell({
  children,
  isAuthenticated,
  userRole,
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/register" ||
    pathname === "/login" ||
    pathname === "/verify-email";

  const hideChrome = pathname.startsWith("/sitter") || pathname.startsWith("/admin");

  // Login, registration, and email verification pages
  if (isAuthPage) {
    return (
      <div
        className={`auth-layout${
          pathname === "/register"
            ? " auth-layout-scroll"
            : ""
        }`}
      >
        <SiteHeader
          isAuthenticated={isAuthenticated}
          userRole={userRole}
        />
        {children}
      </div>
    );
  }

  // Sitter and owner pages have their own navigation/layout
  if (hideChrome || pathname.startsWith("/owner")) {
    return <>{children}</>;
  }

  // All normal pages
  return (
    <>
      <SiteHeader
        isAuthenticated={isAuthenticated}
        userRole={userRole}
      />

      {children}

      
<SiteFooter
  isAuthenticated={isAuthenticated}
  userRole={userRole}
/>

    </>
  );
}
