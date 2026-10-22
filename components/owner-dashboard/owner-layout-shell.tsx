import type { ReactNode } from "react";
import { DashboardHeader } from "./dashboard-header";
import { OwnerSidebar } from "./owner-sidebar";
import { prisma } from "../../lib/prisma";
import { getCurrentSession } from "../../lib/session";

export default async function OwnerLayoutShell({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  const user = session
    ? await prisma.users.findUnique({
        where: { user_id: BigInt(session.sub) },
        select: { first_name: true, last_name: true },
      })
    : null;
  const userName = `${user?.first_name || "Pet"} ${user?.last_name || "Owner"}`.trim();

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
