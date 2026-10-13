import "./admin-typography.css";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "../../modules/admin/admin.service";
import AdminShell from "./components/admin-shell";

export default async function AdminLayout({ children }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
