"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarIcon,
  FileIcon,
  GridIcon,
  LogOutIcon,
  MailIcon,
  PawIcon,
  SearchIcon,
  StoreIcon,
  UserIcon,
} from "./dashboard-icons";

const navigation = [
  { label: "Dashboard", icon: GridIcon, href: "/owner/dashboard", group: "Manage" },
  { label: "My Pets", icon: PawIcon, href: "/owner/pets", group: "Manage" },
  { label: "Find a Sitter", icon: SearchIcon, href: "/owner/sitters", group: "Manage" },
  { label: "My Bookings", icon: CalendarIcon, href: "/owner/bookings", group: "Manage" },
  { label: "Messages", icon: MailIcon, href: "#messages", group: "Manage" },
  { label: "Marketplace", icon: StoreIcon, href: "/marketplace", group: "Explore" },
  { label: "Blog", icon: FileIcon, href: "/blog", group: "Explore" },
  { label: "My Profile", icon: UserIcon, href: "#profile", group: "Account" },
];

const groups = ["Manage", "Explore", "Account"];

type SidebarItem = {
  label: string;
  icon: typeof GridIcon;
  href: string;
  group: string;
};

type OwnerSidebarProps = {
  items?: SidebarItem[];
  homeHref?: string;
  navigationLabel?: string;
};

export function OwnerSidebar({
  items = navigation,
  homeHref = "/owner/dashboard",
  navigationLabel = "Owner dashboard navigation",
}: OwnerSidebarProps = {}) {
  const pathname = usePathname() || "";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  function isActive(label: string, href: string) {
    const isMarketplace =
      label === "Marketplace" &&
      (pathname.startsWith("/owner/marketplace") ||
        pathname === "/marketplace/new");

    return (
      isMarketplace ||
      (href.startsWith("/") &&
        (pathname === href ||
          (href !== homeHref && pathname.startsWith(`${href}/`)) ||
          (href === "/owner/pets" && pathname.startsWith("/owner/pets/")) ||
          (href === "/owner/bookings" &&
            pathname.startsWith("/owner/bookings/")) ||
        (href === "/marketplace" && pathname.startsWith("/marketplace/"))))
    );
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile top bar; the full navigation lives in the drawer below. */}
      <div className="flex h-16 items-center justify-between border-b border-[#EEDFE1] bg-white px-4 lg:hidden">
        <Link href={homeHref} aria-label="PetSphere dashboard" onClick={closeMobileMenu}>
          <Image
            src="/petsphere-logo.svg"
            alt="PetSphere"
            width={160}
            height={40}
            priority
            className="h-auto w-40"
          />
        </Link>
        <button
          type="button"
          aria-label={mobileOpen ? "Close owner navigation" : "Open owner navigation"}
          aria-expanded={mobileOpen}
          aria-controls="owner-sidebar-navigation"
          onClick={() => setMobileOpen((open) => !open)}
          className="grid size-11 place-items-center rounded-lg text-[#6F6E78] transition-colors duration-200 hover:bg-[#FFF1F2] hover:text-[#A13D3F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A13D3F]"
        >
          <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          <span className="relative block h-4 w-5" aria-hidden="true">
            <span className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`absolute left-0 top-2 h-0.5 w-5 bg-current transition ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-4 h-0.5 w-5 bg-current transition ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close owner navigation"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-67 flex-col overflow-y-auto border-r border-[#EEDFE1] bg-white shadow-xl transition-[transform,width] duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-19" : "lg:w-62"}`}
      >
        <div className="flex min-h-full flex-col px-3 py-5">
          <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-2`}>
            <Link
              href={homeHref}
              aria-label="PetSphere dashboard"
              onClick={closeMobileMenu}
              className={`block overflow-hidden transition-[width] duration-200 ${collapsed ? "w-9" : "w-45"}`}
            >
              <Image
                src="/petsphere-logo.svg"
                alt="PetSphere"
                width={180}
                height={45}
                priority
                className={`h-auto max-w-none ${collapsed ? "w-45" : "w-full"}`}
              />
            </Link>

            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
              className="hidden size-9 shrink-0 place-items-center rounded-lg text-[#6F6E78] transition-colors duration-200 hover:bg-[#FFF1F2] hover:text-[#A13D3F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A13D3F] lg:grid"
            >
              <span className="text-lg leading-none" aria-hidden="true">
                {collapsed ? "›" : "‹"}
              </span>
            </button>
          </div>

          <nav
            id="owner-sidebar-navigation"
            aria-label={navigationLabel}
            className="mt-8 flex flex-col gap-6"
          >
            {groups.map((group) => (
              <div key={group}>
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#75686A]">
                    {group}
                  </p>
                )}
                <div className="space-y-1">
                  {items
                    .filter((item) => item.group === group)
                    .map(({ label, icon: Icon, href }) => {
                      const active = isActive(label, href);

                      return (
                        <Link
                          key={label}
                          href={href}
                          aria-current={active ? "page" : undefined}
                          aria-label={collapsed ? label : undefined}
                          title={collapsed ? label : undefined}
                          onClick={closeMobileMenu}
                          className={`group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-[12px] font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#A13D3F] ${
                            collapsed ? "justify-center" : ""
                          } ${
                            active
                              ? "bg-[#A13D3F] text-white! shadow-sm"
                              : "text-[#403537] hover:bg-[#FFF1F2] hover:text-[#A13D3F]"
                          }`}
                        >
                          {active && (
                            <span
                              className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-white"
                              aria-hidden="true"
                            />
                          )}
                          <Icon className={`size-4.5 shrink-0 transition-colors duration-200 ${active ? "text-white" : "text-[#75686A] group-hover:text-[#A13D3F]"}`} />
                          {!collapsed && <span>{label}</span>}
                        </Link>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto border-t border-[#EEDFE1] pt-4">
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                aria-label={collapsed ? "Log out" : undefined}
                title={collapsed ? "Log out" : undefined}
                className={`group flex min-h-11 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-[12px] font-semibold text-[#403537] transition-colors duration-200 hover:bg-[#FFF1F2] hover:text-[#A13D3F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A13D3F] ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <span className="grid size-4.5 shrink-0 place-items-center text-[#75686A] transition-colors duration-200 group-hover:text-[#A13D3F]">
                  <LogOutIcon className="size-4.5" />
                </span>
                {!collapsed && "Logout"}
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
