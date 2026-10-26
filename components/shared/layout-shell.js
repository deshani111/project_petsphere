
"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader } from "./site-chrome";
import SitterSidebar from "../../app/sitter/Sidebar";
import { OwnerSidebar } from "../owner-dashboard/owner-sidebar";
import { DashboardTopbar } from "../dashboard/dashboard-topbar";

export default function LayoutShell({
  children,
  isAuthenticated,
  userRole,
  userName = "",
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/register" ||
    pathname === "/login" ||
    pathname === "/verify-email" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const hideMarketplaceNavigation = pathname.startsWith("/marketplace/");
  const hideChrome = pathname.startsWith("/sitter") || pathname.startsWith("/admin") || hideMarketplaceNavigation;
  const isMarketplaceRoute =
    pathname === "/marketplace" ||
    pathname === "/marketplace/new" ||
    pathname === "/marketplace/my-ads" ||
    /^\/marketplace\/\d+$/.test(pathname);

  if (isMarketplaceRoute && userRole === "pet_sitter") {
    return (
      <div className="marketplace-sitter-shell">
        <SitterSidebar />
        <div className="marketplace-dashboard-main marketplace-sitter-content">
          <DashboardTopbar userName={userName} variant="marketplace" />
          <main>{children}</main>
        </div>
      </div>
    );
  }

  if (isMarketplaceRoute && userRole === "pet_owner") {
    return (
      <div className="marketplace-owner-shell">
        <OwnerSidebar />
        <div className="marketplace-dashboard-main marketplace-owner-content">
          <DashboardTopbar userName={userName} variant="marketplace" />
          <main>{children}</main>
        </div>
      </div>
    );
  }

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
          userName={userName}
        />
        {children}
      </div>
    );
  }

  // Sitter and owner pages have their own navigation/layout
  if (hideChrome || pathname.startsWith("/owner")) {
    if (hideMarketplaceNavigation) {
      return (
        <>
          <SiteHeader isAuthenticated={isAuthenticated} hideNavigation />
          {children}
        </>
      );
    }
    return <>{children}</>;
  }

  // All normal pages
  return (
    <>
      <SiteHeader
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        userName={userName}
      />

      {children}


<SiteFooter
  isAuthenticated={isAuthenticated}
  userRole={userRole}
/>

    </>
  );
}
