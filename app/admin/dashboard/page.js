import AdminDashboardClient from "./dashboard-client";
import { getAdminDashboardData } from "../../../modules/admin/admin.service";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default async function AdminDashboardPage() {
  try {
    return <AdminDashboardClient previewData={await getAdminDashboardData()} />;
  } catch {
    return <AdminDashboardClient initialError="Dashboard data could not be loaded." />;
  }
}
