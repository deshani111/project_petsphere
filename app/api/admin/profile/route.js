import { NextResponse } from "next/server";
import { resolveCurrentAdmin } from "../../../../modules/admin/admin.service";
import { getAdminProfileData, updateAdminProfile } from "../../../../modules/admin/profile.service";

export async function GET() {
  const resolved = await resolveCurrentAdmin();

  if (resolved.status !== 200) {
    return NextResponse.json(
      { message: resolved.status === 401 ? "Authentication required." : "Admin access is required." },
      { status: resolved.status }
    );
  }

  try {
    const profile = await getAdminProfileData(resolved.account);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Admin profile data could not be loaded:", error);
    return NextResponse.json({ message: "Unable to load profile information." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const resolved = await resolveCurrentAdmin();

  if (resolved.status !== 200) {
    return NextResponse.json(
      { message: resolved.status === 401 ? "Authentication required." : "Admin access is required." },
      { status: resolved.status }
    );
  }

  try {
    const body = await request.json();
    const profile = await updateAdminProfile(resolved.account, body);
    return NextResponse.json(profile);
  } catch (error) {
    const message = error?.message || "Unable to update your profile. Please try again.";
    return NextResponse.json(
      { message },
      { status: message.includes("required") || message.includes("supported") ? 400 : 500 }
    );
  }
}
