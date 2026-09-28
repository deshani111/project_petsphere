import { DashboardHeader } from "../../../components/owner-dashboard/dashboard-header";
import { DashboardOverview } from "../../../components/owner-dashboard/dashboard-overview";
import { OwnerSidebar } from "../../../components/owner-dashboard/owner-sidebar";


export default async function OwnerDashboardPage() {

  return (
    <div className="flex min-h-screen bg-[#FFF8F7]">
      <OwnerSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <DashboardOverview />
      </div>
    </div>
  );
}
