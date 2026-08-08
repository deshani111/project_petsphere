import { DashboardHeader } from "../../../components/owner-dashboard/dashboard-header";
import { DashboardOverview } from "../../../components/owner-dashboard/dashboard-overview";
import { OwnerSidebar } from "../../../components/owner-dashboard/owner-sidebar";

export default function OwnerDashboardPage() {
  return (
    <main className="min-h-screen bg-[#fff9f8] lg:grid lg:grid-cols-[224px_minmax(0,1fr)]">
      <OwnerSidebar />
      <div className="min-w-0">
        <DashboardHeader />
        <DashboardOverview />
      </div>
    </main>
  );
}
