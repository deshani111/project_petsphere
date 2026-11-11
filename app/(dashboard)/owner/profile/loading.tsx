import { DashboardHeader } from "../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../components/owner-dashboard/owner-sidebar";

function LoadingBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl border border-[#EEDFE1] bg-white ${className}`} />;
}

export default function OwnerProfileLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFF8F8] lg:flex-row">
      <OwnerSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-4 flex justify-between"><div className="h-7 w-36 animate-pulse rounded bg-rose-100" /><div className="h-8 w-28 animate-pulse rounded bg-rose-100" /></div>
            <LoadingBlock className="mb-4 h-32" />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-4"><LoadingBlock className="h-64" /><LoadingBlock className="h-36" /></div>
              <div className="grid gap-4"><LoadingBlock className="h-64" /><LoadingBlock className="h-56" /></div>
            </div>
            <LoadingBlock className="mt-4 h-44" />
          </div>
        </main>
      </div>
    </div>
  );
}
