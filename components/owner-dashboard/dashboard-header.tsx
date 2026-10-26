"use client";

import Link from "next/link";
import Image from "next/image";
import { BellIcon } from "./dashboard-icons";
import { useOwnerHeaderName } from "./owner-header-context";

type DashboardHeaderProps = {
  userName?: string;
  userImage?: string | null;
  unreadMessages?: number;
};

export function DashboardHeader({
  userName,
  userImage,
  unreadMessages = 0,
}: DashboardHeaderProps) {
  const ownerName = useOwnerHeaderName();

  const displayName = userName?.trim() || ownerName || "Pet Owner";

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "PO";

  return (
    <header className="sticky top-0 z-20 h-[62px] border-b border-[#EEDFE1] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full max-w-[1480px] items-center justify-end gap-3">
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
          {/* Notification Button */}
          <button
            type="button"
            disabled
            title="Owner message center is not implemented yet"
            aria-label={`${unreadMessages} unread messages`}
            className="relative grid size-8 cursor-not-allowed place-items-center rounded-full text-slate-600"
          >
            <BellIcon className="size-4" />

            {unreadMessages > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#A63842] px-1 text-[8px] font-bold text-white">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </button>

          {/* Divider */}
          <span className="hidden h-7 w-px bg-slate-200 sm:block" />

          {/* Owner Profile */}
          <div className="flex items-center gap-2">
            <span className="relative grid size-10 place-items-center overflow-hidden rounded-full bg-[#A63842] text-[11px] font-bold text-white">
              {userImage ? (
                <Image
                  src={userImage}
                  alt=""
                  fill
                  unoptimized
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                initials
              )}
            </span>

            <div className="hidden sm:block">
              <p className="max-w-40 truncate text-xs font-semibold leading-tight text-slate-800">
                {displayName}
              </p>

              <p className="mt-0.5 text-[10px] leading-tight text-slate-400">
                Pet Owner
              </p>
            </div>
          </div>

          {/* Find a Sitter Button */}
          <Link
            href="/owner/sitters"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#A63842] px-3 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#8E303A]"
          >
            Find a Sitter
          </Link>
        </div>
      </div>
    </header>
  );
}