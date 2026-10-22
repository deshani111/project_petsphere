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
      <header className="marketplace-dashboard-topbar">
        <button type="button" aria-label="View notifications" className="marketplace-notification">
          <Bell size={18} strokeWidth={1.7} />
          <span />
        </button>
        <div className="marketplace-topbar-divider" />
        <div className="marketplace-user">
          <span>{getInitials(userName, "PS")}</span>
          <strong>{userName || "PetSphere user"}</strong>
        </div>
      </header>
    );
  }

  return (
    <header className="h-15 border-b border-[#e9dddd] bg-white px-5">
      <div className="flex h-full items-center justify-end gap-5">
        <button
          type="button"
          aria-label="View notifications"
          className="relative grid size-9 place-items-center rounded-full text-[#564b4d] transition hover:bg-[#fff1f0] hover:text-[#ab3d42]"
        >
          <BellIcon className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#d85b5d]" />
        </button>

        <div className="h-7 w-px bg-[#eee5e3]" />

        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-[#ab3d42] text-[11px] font-bold text-white">
            {getInitials(userName, "PO")}
          </span>

          <span className="hidden text-[12px] font-semibold text-[#34292b] sm:block">
            {userName || "Pet Owner"}
          </span>
        </div>
      </div>
    </header>
  );
}
