import { getCurrentAdmin } from "../../../../modules/admin/admin.service";
import { getAdminProfileData } from "../../../../modules/admin/profile.service";
import EditProfileClient from "./edit-profile-client";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default async function AdminProfileEditPage() {
  const account = await getCurrentAdmin();
  const data = await getAdminProfileData(account);

  return <EditProfileClient data={data} />;
}
