import { BellIcon } from "./dashboard-icons";

export function DashboardHeader() {
  return (
    <header className="flex h-18 shrink-0 items-center justify-end border-b border-[#f1e6e4] bg-white px-4 sm:px-6">
      <div className="flex items-center gap-5">
        <button type="button" aria-label="View notifications" className="relative grid size-9 place-items-center rounded-full text-[#564b4d] transition hover:bg-[#fff1f0] hover:text-[#ab3d42]">
          <BellIcon className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#d85b5d]" />
        </button>
        <div className="h-7 w-px bg-[#eee5e3]" />
        <div className="flex items-center gap-2.5">
          <img className="size-8 rounded-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80" alt="John Perera" />
          <span className="hidden text-[11px] font-semibold text-[#34292b] sm:block">John Perera</span>
        </div>
      </div>
    </header>
  );
}
