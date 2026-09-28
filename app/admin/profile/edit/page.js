import { getCurrentAdmin } from "../../../../modules/admin/admin.service";
import { getAdminProfileData } from "../../../../modules/admin/profile.service";
import EditProfileClient from "./edit-profile-client";

export default async function AdminProfileEditPage() {
  const account = await getCurrentAdmin();
  const data = await getAdminProfileData(account);

  return <EditProfileClient data={data} />;
}
