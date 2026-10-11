"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = ["Dashboard", "My Pets", "Find a Sitter", "My Bookings", "Messages", "Marketplace", "Blogs", "My Profile"];
const steps = ["Service", "Pet", "Dates", "Instructions"];

function PawMark() {
  return <span className="grid h-[17px] w-[17px] place-items-center rounded-[5px] bg-[#A13D3F] text-[9px] text-white">♥</span>;
}

export default function BookingFlowShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentStep = pathname.endsWith("/pet") ? 1 : pathname.endsWith("/dates") ? 2 : pathname.endsWith("/instructions") ? 3 : 0;

  return (
    <main className="booking-flow-shell min-h-screen bg-[#fff8f7] font-[Inter,Arial,sans-serif] text-[#2b2323] md:flex">
      <style jsx>{`
        @media (min-width: 768px) {
          main > aside { width: 154px !important; padding: 18px 10px 17px !important; }
          main > aside > a:first-child { padding: 0 7px 22px !important; font-size: 15px !important; gap: 4px !important; }
          main > aside > a:first-child small { margin-top: 5px !important; font-size: 5px !important; }
          main > aside > a:first-child > span:first-child { font-size: 0 !important; }
          main > aside > a:first-child > span:first-child::after { content: "\\2665 "; font-size: 9px; color: white; }
          main > aside nav { gap: 4px !important; }
          main > aside nav a { height: 25px !important; gap: 8px !important; border-radius: 5px !important; padding: 0 8px !important; font-size: 9px !important; }
          main > aside nav a span { width: 13px !important; font-size: 0 !important; }
          main > aside nav a span::after { font-size: 11px; }
          main > aside nav a:nth-child(1) span::after { content: "\\25a6 "; }
          main > aside nav a:nth-child(2) span::after { content: "\\2665 "; }
          main > aside nav a:nth-child(3) span::after { content: "\\2315 "; }
          main > aside nav a:nth-child(4) span::after { content: "\\25a3 "; }
          main > aside nav a:nth-child(5) span::after { content: "\\25a1 "; }
          main > aside nav a:nth-child(6) span::after { content: "\\25a4 "; }
          main > aside nav a:nth-child(7) span::after { content: "\\2630 "; }
          main > aside nav a:nth-child(8) span::after { content: "\\25cb "; }
          main > aside > a:last-child { gap: 8px !important; padding: 14px 7px 0 !important; font-size: 9px !important; }
          main > section > header { height: 48px !important; padding: 0 22px !important; }
          main > section > header > div { gap: 9px !important; font-size: 8px !important; }
          main > section > header > div > span:nth-child(3) { width: 20px !important; height: 20px !important; font-size: 7px !important; }
          main > section > header > div > span:first-child { font-size: 0 !important; }
          main > section > header > div > span:first-child::after { content: "\\2661 "; font-size: 12px; }
          main > section > div[aria-label="Booking progress"] { height: 70px !important; padding-top: 10px !important; }
          main > section > div[aria-label="Booking progress"] > div { width: 120px !important; }
          main > section > div[aria-label="Booking progress"] > div > span { width: 24px !important; height: 24px !important; font-size: 9px !important; }
          main > section > div[aria-label="Booking progress"] small { margin-top: 3px !important; font-size: 5px !important; }
          main > section > div[aria-label="Booking progress"] i { left: 76px !important; top: 12px !important; width: 44px !important; }
        }
      `}</style>
      <aside className="booking-flow-sidebar hidden min-h-screen w-[250px] shrink-0 flex-col border-r border-[#efdada] bg-white px-4 pb-6 pt-7 md:flex">
        <Link href="/" className="flex items-start gap-2 px-2 pb-8 text-[21px] font-bold leading-none text-[#A13D3F]"><PawMark /><span>Pet<span>Sphere</span><small className="mt-2 block text-[7px] font-medium tracking-[.55px] text-[#594d4e]">PET CARE PLATFORM</small></span></Link>
        <nav className="grid gap-2" aria-label="Owner navigation">
          {navItems.map((item) => <Link key={item} href={item === "Find a Sitter" ? "/owner/bookings/new" : "#"} className={`flex h-10 items-center gap-3 rounded-[7px] px-3 text-[12px] ${item === "Find a Sitter" ? "bg-[#A13D3F] font-bold text-white shadow-[0_4px_10px_rgba(161,61,63,.14)]" : "text-[#625758] hover:bg-[#fff4f2]"}`}><span className="w-4 text-[16px]">{item === "Find a Sitter" ? "⌕" : "▦"}</span>{item}</Link>)}
        </nav>
        <Link href="/" className="mt-auto flex gap-3 border-t border-[#ead7d6] px-2 pt-5 text-[12px] text-[#625758]">⇥ <span>Logout</span></Link>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="flex h-[64px] items-center justify-end border-b border-[#efdada] bg-white px-6 md:px-10"><div className="flex items-center gap-3 text-[#302a2a]"><span className="mr-4 hidden text-[15px] text-[#A13D3F] sm:inline">♧</span><span className="grid h-8 w-8 place-items-center rounded-full bg-[#3f607a] text-[9px] text-white">JP</span><strong className="hidden text-[11px] sm:block">John Perera</strong></div></header>
        <div className="flex h-[94px] justify-start overflow-hidden pl-5 pt-5 md:justify-center md:pl-0" aria-label="Booking progress">
          {steps.map((label, index) => <div key={label} className="relative grid w-[112px] shrink-0 justify-items-center md:w-[155px]"><span className={`grid h-7 w-7 place-items-center rounded-full border text-[11px] ${index < currentStep ? "border-[#A13D3F] bg-[#A13D3F] text-white" : index === currentStep ? "border-[#A13D3F] bg-[#A13D3F] text-white" : "border-[#DCC0BF] bg-[#fffafa] text-[#b8a5a4]"}`}>{index < currentStep ? "✓" : index + 1}</span><small className={`mt-1.5 text-[8px] font-bold uppercase ${index <= currentStep ? "text-[#A13D3F]" : "text-[#817574]"}`}>{label}</small>{index < 3 && <i className={`absolute left-[76px] top-[14px] w-9 border-t md:left-[96px] md:w-[59px] ${index < currentStep ? "border-[#A13D3F]" : "border-[#DCC0BF]"}`} />}</div>)}
        </div>
        {children}
      </section>
    </main>
  );
}
