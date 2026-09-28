"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardHeader } from "../../../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../../../components/owner-dashboard/owner-sidebar";

const steps = ["Service", "Pet", "Dates", "Instructions"];

export default function BookingFlowShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentStep = pathname.endsWith("/pet") ? 1 : pathname.endsWith("/dates") ? 2 : pathname.endsWith("/review") ? 3 : 0;

  return (
    <main className="min-h-screen bg-[#fffafa] font-[Inter,Arial,sans-serif] text-[#2d2526] md:flex">
      <OwnerSidebar />

      <section className="min-w-0 flex-1">
        <DashboardHeader />
        <div className="flex h-[94px] justify-start overflow-hidden pl-5 pt-5 md:justify-center md:pl-0" aria-label="Booking progress">
          {steps.map((label, index) => <div key={label} className="relative grid w-[112px] shrink-0 justify-items-center md:w-[155px]"><span className={`grid h-7 w-7 place-items-center rounded-full border text-[11px] ${index < currentStep ? "border-[#A13D3F] bg-[#A13D3F] text-white" : index === currentStep ? "border-[#A13D3F] bg-[#A13D3F] text-white" : "border-[#DCC0BF] bg-[#fffafa] text-[#b8a5a4]"}`}>{index < currentStep ? "✓" : index + 1}</span><small className={`mt-1.5 text-[8px] font-bold uppercase ${index <= currentStep ? "text-[#A13D3F]" : "text-[#817574]"}`}>{label}</small>{index < 3 && <i className={`absolute left-[76px] top-[14px] w-9 border-t md:left-[96px] md:w-[59px] ${index < currentStep ? "border-[#A13D3F]" : "border-[#DCC0BF]"}`} />}</div>)}
        </div>
        {children}
      </section>
    </main>
  );
}
