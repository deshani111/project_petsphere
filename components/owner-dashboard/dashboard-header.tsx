import { BellIcon } from "./dashboard-icons";

export function DashboardHeader({
  userName = "Pet Owner",
}: {
  userName?: string;
}) {
  const initials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "PO";

  return (
    <header className="h-[60px] border-b border-[#e9dddd] bg-white px-5">
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
            {initials}
          </span>

          <span className="hidden text-[12px] font-semibold text-[#34292b] sm:block">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}