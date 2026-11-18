"use client";

import { BellIcon } from "../owner-dashboard/dashboard-icons";
import { Bell } from "lucide-react";

type DashboardTopbarProps = {
  userName?: string;
  variant?: "owner" | "marketplace";
};

function getInitials(userName: string, fallback: string) {
  return userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || fallback;
}

export function DashboardTopbar({
  userName = "",
  variant = "owner",
}: DashboardTopbarProps) {
  if (variant === "marketplace") {
    return (
      <header className="sticky top-0 z-40 flex min-h-16 justify-end border-b border-[var(--ps-color-border)] bg-[color:var(--ps-color-surface)]/95 px-4 backdrop-blur sm:px-7">
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
        <button type="button" aria-label="View notifications" className="ps-icon-button size-10 rounded-lg">
          <Bell size={18} strokeWidth={1.7} />
        </button>
        <div className="h-8 w-px bg-[var(--ps-color-border)]" />
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-full bg-[var(--ps-color-primary)] text-[11px] font-bold text-white ring-4 ring-[var(--ps-color-primary-soft)]">
            {getInitials(userName, "PO")}
          </span>
          <strong className="hidden max-w-40 truncate text-xs font-semibold ps-text-default sm:block">
            {userName || "PetSphere user"}
          </strong>
        </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-15 border-b border-[var(--ps-color-border)] bg-[var(--ps-color-surface)] px-5">
      <div className="flex h-full items-center justify-end gap-5">
        <button
          type="button"
          aria-label="View notifications"
          className="ps-icon-button relative size-9"
        >
          <BellIcon className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[var(--ps-color-danger)]" />
        </button>

        <div className="h-7 w-px bg-[var(--ps-color-border)]" />

        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-[var(--ps-color-primary)] text-[11px] font-bold text-white">
            {getInitials(userName, "PO")}
          </span>

          <span className="hidden text-xs font-semibold ps-text-default sm:block">
            {userName || "PetSphere user"}
          </span>
        </div>
      </div>
    </header>
  );
}
