import { getCurrentAdmin } from "../../../modules/admin/admin.service";
import { getAdminProfileData } from "../../../modules/admin/profile.service";
import ProfileClient from "./profile-client";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default async function AdminProfilePage({ searchParams }) {
  const sp = await searchParams;
  const account = await getCurrentAdmin();
  const data = await getAdminProfileData(account);
  const updated = sp?.updated === "1" ? "Profile updated successfully." : "";

  return <ProfileClient data={data} notice={updated} />;
}
