use client

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PawPrint,
  LayoutGrid,
  CalendarCheck,
  Dog,
  Wallet,
  MessageSquare,
  FileText,
  Store,
  Star,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "My Bookings", href: "/bookings", icon: CalendarCheck },
  { label: "My Services", href: "/services", icon: Dog },
  { label: "Earnings", href: "/earnings", icon: Wallet },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Blogs", href: "/blogs", icon: FileText },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Reviews", href: "/reviews", icon: Star },
  { label: "My Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <PawPrint className="h-6 w-6 text-[#8B2E3C]" />
        <div>
          <h1 className="text-lg font-bold leading-none text-[#8B2E3C]">
            PetSphere
          </h1>
          <p className="mt-1 text-[10px] font-medium tracking-wide text-gray-400">
            PET CARE PLATFORM
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Nav items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#8B2E3C] text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive ? "text-white" : "text-gray-400"
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 px-3 py-4">
        <button
          onClick={() => {
            // handle logout logic here
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4 text-gray-400" />
          Logout
        </button>
      </div>
    </aside>
  );
}

