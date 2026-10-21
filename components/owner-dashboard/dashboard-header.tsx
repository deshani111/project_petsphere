"use client";

import Link from "next/link";
import Image from "next/image";
import { BellIcon, SearchIcon } from "./dashboard-icons";
import { useOwnerHeaderName } from "./owner-header-context";

export function DashboardHeader({ userName, userImage, unreadMessages = 0 }: { userName?: string; userImage?: string | null; unreadMessages?: number }) {
  const ownerName = useOwnerHeaderName();
  const displayName = userName?.trim() || ownerName || "Pet Owner";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "PO";

  return (
    <header className="sticky top-0 z-20 h-[62px] border-b border-[#EEDFE1] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-7">
      <div className="mx-auto flex h-full max-w-[1480px] items-center justify-between gap-3">
        <Link href="/owner/sitters" className="flex min-w-0 max-w-[480px] flex-1 items-center gap-2 rounded-full border border-[#EEDFE1] bg-[#F8F9FB] px-3 py-2 text-[10px] text-[#817f88] transition hover:border-[#EEDFE1] hover:bg-[#FFF1F2] sm:text-[11px]">
          <SearchIcon className="size-3.5 shrink-0 text-[#6f6e78]" />
          <span className="truncate">Search sitters, services, bookings…</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
          <button type="button" disabled title="Owner message center is not implemented yet" aria-label={`${unreadMessages} unread messages`} className="relative grid size-8 cursor-not-allowed place-items-center rounded-full text-slate-600">
            <BellIcon className="size-4" />
            {unreadMessages > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#A63842] px-1 text-[8px] font-bold text-white">{unreadMessages > 9 ? "9+" : unreadMessages}</span>}
          </button>
          <span className="hidden h-7 w-px bg-slate-200 sm:block" />
          <div className="flex items-center gap-2">
          <span className="relative grid size-10 place-items-center overflow-hidden rounded-full bg-[#A63842] text-[11px] font-bold text-white">{userImage ? <Image src={userImage} alt="" fill unoptimized sizes="40px" className="object-cover" /> : initials}</span>
            <div className="hidden sm:block"><p className="max-w-40 truncate text-xs font-semibold leading-tight text-slate-800">{displayName}</p><p className="mt-0.5 text-[10px] leading-tight text-slate-400">Pet Owner</p></div>
          </div>
          <Link href="/owner/bookings/new" className="hidden h-8 items-center gap-1.5 rounded-md bg-[#A63842] px-3 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#8E303A] sm:inline-flex">Book a Sitter</Link>
        </div>
      </div>
    </header>
  );
}
