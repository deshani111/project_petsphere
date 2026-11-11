"use client";

import { OwnerSidebar } from "../../components/owner-dashboard/owner-sidebar";
import {
  LayoutDashboard,
  CalendarDays,
  PawPrint,
  WalletCards,
  MessageSquare,
  FileText,
  Store,
  Star,
  UserRound
} from "lucide-react";

const items = [
  { label: "Dashboard", href: "/sitter", icon: LayoutDashboard, group: "Manage" },
  { label: "My Bookings", href: "/sitter/bookings", icon: CalendarDays, group: "Manage" },
  { label: "My Services", href: "/sitter/services", icon: PawPrint, group: "Manage" },
  { label: "Earnings", href: "/sitter/earnings", icon: WalletCards, group: "Manage" },
  { label: "Messages", href: "/sitter/messages", icon: MessageSquare, group: "Manage" },
  { label: "Blog", href: "/blog", icon: FileText, group: "Explore" },
  { label: "Marketplace", href: "/marketplace", icon: Store, group: "Explore" },
  { label: "Reviews", href: "/sitter/reviews", icon: Star, group: "Explore" },
  { label: "My Profile", href: "/sitter/Profile", icon: UserRound, group: "Account" },
];

export default function Sidebar() {
  return <OwnerSidebar items={items} homeHref="/sitter" navigationLabel="Sitter dashboard navigation" />;
}
