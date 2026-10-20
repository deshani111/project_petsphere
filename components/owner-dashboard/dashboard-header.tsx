import { DashboardTopbar } from "../dashboard/dashboard-topbar";

export function DashboardHeader({
  userName = "Pet Owner",
}: {
  userName?: string;
}) {
  return <DashboardTopbar userName={userName} />;
}