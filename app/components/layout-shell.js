
"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader } from "./site-chrome";
import SitterSidebar from "../sitter/Sidebar";
import { OwnerSidebar } from "../../components/owner-dashboard/owner-sidebar";
import { Bell } from "lucide-react";

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

  const hideChrome = pathname.startsWith("/sitter");

  if (pathname === "/marketplace" && userRole === "pet_sitter") {
    return (
      <div className="marketplace-sitter-shell">
        <SitterSidebar />
        <div className="marketplace-dashboard-main marketplace-sitter-content">
          <DashboardTopbar userName={userName} />
          <main>{children}</main>
        </div>
      </div>
    );
  }

  if (pathname === "/marketplace" && userRole === "pet_owner") {
    return (
      <div className="marketplace-owner-shell">
        <OwnerSidebar />
        <div className="marketplace-dashboard-main marketplace-owner-content">
          <DashboardTopbar userName={userName} />
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

function DashboardTopbar({ userName }) {
  const initials = userName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "PS";

  return (
    <header className="marketplace-dashboard-topbar">
      <button type="button" aria-label="View notifications" className="marketplace-notification">
        <Bell size={18} strokeWidth={1.7} />
        <span />
      </button>
      <div className="marketplace-topbar-divider" />
      <div className="marketplace-user">
        <span>{initials}</span>
        <strong>{userName || "PetSphere user"}</strong>
      </div>
    </header>
  );
}
