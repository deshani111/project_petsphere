
"use client";

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
    <header className="sticky top-0 z-20 flex min-h-16 justify-end border-b border-[#EEDFE1] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
        {/* Notification Button */}
        <button
          type="button"
          disabled
          title="Owner message center is not implemented yet"
          aria-label={`${unreadMessages} unread messages`}
          className="relative grid size-10 cursor-not-allowed place-items-center rounded-lg text-[#75686A] opacity-80 transition-colors hover:bg-[#FFF1F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A13D3F]"
        >
          <BellIcon className="size-4" />

          {unreadMessages > 0 && (
            <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#A13D3F] px-1 text-[8px] font-bold text-white">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </span>
          )}
        </button>

        {/* Divider */}
        <span className="hidden h-8 w-px bg-[#EEDFE1] sm:block" />

        {/* Owner Profile */}
        <div className="flex items-center gap-2">
          <span className="relative grid size-10 place-items-center overflow-hidden rounded-full bg-[#A13D3F] text-[11px] font-bold text-white ring-4 ring-[#FFF1F2]">
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
            <p className="max-w-40 truncate text-xs font-semibold leading-tight text-[#403537]">
              {displayName}
            </p>

            <p className="mt-0.5 text-[10px] leading-tight text-[#9A898B]">
              Pet Owner
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}
