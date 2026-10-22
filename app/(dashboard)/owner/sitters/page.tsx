import { DashboardHeader } from "../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../components/owner-dashboard/owner-sidebar";
import SitterDiscovery from "./sitter-discovery";

export default function FindSitterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FB] lg:flex-row">
      <OwnerSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <SitterDiscovery />
        </main>
      </div>
    </div>
  );
}
