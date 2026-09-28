import "./admin-typography.css";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "../../modules/admin/admin.service";
import AdminShell from "./components/admin-shell";

export default async function AdminLayout({ children }) {
  const requestHeaders = await headers();
  const isDevelopmentPreview =
    process.env.NODE_ENV === "development" &&
    requestHeaders.get("x-petsphere-dashboard-preview") === "true";

  if (isDevelopmentPreview) {
    return (
      <AdminShell admin={{ fullName: "Development Preview" }}>
        {children}
      </AdminShell>
    );
  }

  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
