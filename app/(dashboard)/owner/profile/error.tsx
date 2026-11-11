"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";
import { DashboardHeader } from "../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../components/owner-dashboard/owner-sidebar";

export default function OwnerProfileError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF8F8] lg:flex-row">
      <OwnerSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[720px] rounded-xl border border-[#EEDFE1] bg-white p-6 text-center shadow-sm sm:p-8">
            <span className="mx-auto grid size-10 place-items-center rounded-full bg-rose-50 text-[#A63842]"><AlertCircle size={19} /></span>
            <h1 className="mt-3 text-lg font-semibold text-[#252630]">We couldn’t load your profile</h1>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[#6F6E78]">Your profile information is temporarily unavailable. Please try again.</p>
            <div className="mt-5 flex justify-center gap-2">
              <button type="button" onClick={reset} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#A63842] px-3 text-xs font-semibold text-white hover:bg-[#8E303A]"><RefreshCw size={13} /> Try again</button>
              <button type="button" onClick={() => router.refresh()} className="h-9 rounded-md border border-[#EEDFE1] px-3 text-xs font-semibold text-[#6F6E78] hover:bg-[#FFF8F8]">Refresh page</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
