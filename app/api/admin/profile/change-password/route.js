import { NextResponse } from "next/server";
import { resolveCurrentAdmin } from "../../../../../modules/admin/admin.service";
import { changeAdminPassword } from "../../../../../modules/admin/profile.service";

export async function POST(request) {
  const resolved = await resolveCurrentAdmin();

  if (resolved.status !== 200) {
    return NextResponse.json(
      { message: resolved.status === 401 ? "Authentication required." : "Admin access is required." },
      { status: resolved.status }
    );
  }

  try {
    const body = await request.json();
    if (!body?.currentPassword || !body?.newPassword || !body?.confirmNewPassword) {
      return NextResponse.json({ message: "Please complete all password fields." }, { status: 400 });
    }

    if (body.newPassword !== body.confirmNewPassword) {
      return NextResponse.json({ message: "Passwords do not match." }, { status: 400 });
    }

    await changeAdminPassword(resolved.account, body);
    return NextResponse.json({ message: "Password changed successfully." });
  } catch (error) {
    const message = error?.message || "Unable to update your password. Please try again.";
    const status = message === "The current password is incorrect." ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}
