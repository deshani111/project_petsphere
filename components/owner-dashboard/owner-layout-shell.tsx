import type { ReactNode } from "react";
import { DashboardHeader } from "./dashboard-header";
import { OwnerSidebar } from "./owner-sidebar";
import { getCurrentSession } from "../../lib/session";

export default async function OwnerLayoutShell({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  const userName = session
    ? `${session.firstName || "Pet"} ${session.lastName || "Owner"}`.trim()
    : "Pet Owner";

  return (
    <div className="flex min-h-screen bg-[#fff8f7]">
      <OwnerSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader userName={userName} />
        {children}
      </div>
    </div>
  );
}
