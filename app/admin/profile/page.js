import { getCurrentAdmin } from "../../../modules/admin/admin.service";
import { getAdminProfileData } from "../../../modules/admin/profile.service";
import ProfileClient from "./profile-client";

export default async function AdminProfilePage({ searchParams }) {
  const account = await getCurrentAdmin();
  const data = await getAdminProfileData(account);
  const updated = searchParams?.updated === "1" ? "Profile updated successfully." : "";

  return <ProfileClient data={data} notice={updated} />;
}
