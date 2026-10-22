
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

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
  {
    label: "Dashboard",
    icon: GridIcon,
    href: "/owner/dashboard",
  },
  {
    label: "My Pets",
    icon: PawIcon,
    href: "/owner/pets",
  },
  {
    label: "Find a Sitter",
    icon: SearchIcon,
    href: "/owner/sitters",
  },
  {
    label: "My Bookings",
    icon: CalendarIcon,
    href: "/owner/bookings",
  },
  {
    label: "Messages",
    icon: MailIcon,
    href: "/owner/messages",
  },
  {
    label: "Marketplace",
    icon: StoreIcon,
    href: "/marketplace",
  },
  {
    label: "Blog",
    icon: FileIcon,
    href: "/blog",
  },
  {
    label: "My Profile",
    icon: UserIcon,
    href: "#profile",
  },
];

export function OwnerSidebar() {
  const pathname = usePathname() || "";

  return (
    <aside className="relative z-30 h-auto w-full border-b border-[#EEDFE1] bg-white lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col px-3 py-3 lg:px-5 lg:py-6">

        {/* PetSphere Logo */}
        <Link
          href="/owner/dashboard"
          className="mb-2 flex items-center gap-2 px-2"
        >
          <Image
            src="/petsphere-logo.svg"
            alt="PetSphere"
            width={165}
            height={41}
            priority
            className="h-auto max-w-full"
          />
        </Link>

        {/* Navigation */}
        <nav
          aria-label="Owner dashboard navigation"
          className="mt-2 flex gap-1 overflow-x-auto pb-1 lg:mt-3 lg:flex-col lg:space-y-1 lg:overflow-visible lg:pb-0"
        >
          {navigation.map(({ label, icon: Icon, href }) => {

            const isMarketplace =
              label === "Marketplace" &&
              (
                pathname.startsWith("/owner/marketplace") ||
                pathname === "/marketplace/new"
              );

            const isBookings =
              href === "/owner/bookings" &&
              (
                pathname === "/owner/bookings" ||
                (
                  pathname.startsWith("/owner/bookings/") &&
                  !pathname.startsWith("/owner/bookings/new")
                )
              );

            const isActive =
              isMarketplace ||
              isBookings ||
              (
                href.startsWith("/") &&
                href !== "/owner/bookings" &&
                (
                  pathname === href ||
                  pathname.startsWith(`${href}/`)
                )
              );

            return (
              <Link
                key={label}
                href={href}
                className={`flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-[10px] font-medium transition-colors lg:h-10 lg:gap-3 lg:text-[12px] ${
                  isActive
                    ? "!bg-[#A63842] !text-white shadow-sm"
                    : "text-[#252630] hover:bg-[#FFF1F2]"
                }`}
              >
                <Icon
                  className={`size-4 ${
                    isActive
                      ? "!text-white"
                      : "text-[#6f6e78]"
                  }`}
                />

                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-2 border-t border-[#EEDFE1] pt-2 lg:mt-auto lg:pt-5">
          <form
            action="/api/auth/logout"
            method="post"
          >
            <button
              type="submit"
              className="flex h-8 w-full items-center gap-2 rounded-md px-3 text-[10px] font-medium text-[#6f6e78] hover:bg-[#FFF1F2] hover:text-[#A63842] lg:h-9 lg:gap-3 lg:text-[12px]"
            >
              <LogOutIcon className="size-4" />
              Logout
            </button>
          </form>
        </div>

      </div>
    </aside>
  );
}
