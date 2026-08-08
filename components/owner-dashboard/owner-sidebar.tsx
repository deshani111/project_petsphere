"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, FileIcon, GridIcon, LogOutIcon, MailIcon, PawIcon, SearchIcon, StoreIcon, UserIcon } from "./dashboard-icons";

const navigation = [
  { label: "Dashboard", icon: GridIcon, href: "/owner/dashboard" },
  { label: "My Pets", icon: PawIcon, href: "/owner/pets" },
  { label: "Find a Sitter", icon: SearchIcon, href: "#find-a-sitter" },
  { label: "My Bookings", icon: CalendarIcon, href: "#bookings" },
  { label: "Messages", icon: MailIcon, href: "#messages" },
  { label: "Marketplace", icon: StoreIcon, href: "#marketplace" },
  { label: "Blog", icon: FileIcon, href: "#blog" },
  { label: "My Profile", icon: UserIcon, href: "#profile" },
];

export function OwnerSidebar() {
  const pathname = usePathname() || "";

  return (
    <aside className="flex min-h-full w-full flex-col border-r border-[#f1e6e4] bg-white px-4 py-6 lg:w-56 lg:px-5">
      <Link href="/owner/dashboard" className="mb-2 flex items-center gap-2 px-2 text-[#ab3d42]">
        <span className="grid size-7 place-items-center rounded-lg bg-[#fde8e8]"><PawIcon className="size-4" /></span>
        <span className="text-lg font-bold tracking-[-0.7px]">PetSphere</span>
      </Link>
      <p className="mb-6 px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#aa9a9a]">Pet care platform</p>
      <nav aria-label="Owner dashboard navigation" className="mt-3 space-y-1">
        {navigation.map(({ label, icon: Icon, href }) => {
          const isActive = href.startsWith("/") ? pathname === href || pathname.startsWith(href) : false;
          return (
            <Link key={label} href={href} className={`flex h-10 items-center gap-3 rounded-md px-3 text-[12px] font-medium transition-colors ${isActive ? "bg-[#ab3d42] text-white shadow-sm" : "text-[#594e50] hover:bg-[#fff2f1] hover:text-[#ab3d42]"}`}>
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-[#f1e6e4] pt-5">
        <a href="#logout" className="flex h-9 items-center gap-3 rounded-md px-3 text-[12px] font-medium text-[#665a5b] hover:bg-[#fff2f1] hover:text-[#ab3d42]">
          <LogOutIcon className="size-4" />
          Logout
        </a>
      </div>
    </aside>
  );
}
