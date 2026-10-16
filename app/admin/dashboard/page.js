import AdminDashboardClient from "./dashboard-client";
import { getAdminDashboardData } from "../../../modules/admin/admin.service";

export default async function AdminDashboardPage() {
  try {
    return <AdminDashboardClient previewData={await getAdminDashboardData()} />;
  } catch {
    return <AdminDashboardClient initialError="Dashboard data could not be loaded." />;
  }
}
