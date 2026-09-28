import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionAccount, isAdminRole, SESSION_COOKIE_NAME } from "../../../../modules/auth/auth.service";
import { getAdminProfileData, updateAdminProfile } from "../../../../modules/admin/profile.service";

async function resolveAdminAccount() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return { status: 401 };
  }

  const account = await getSessionAccount(sessionToken);

  if (!account) {
    return { status: 401 };
  }

  if (!isAdminRole(account.role) || !account.hasAdminProfile || !account.isVerified) {
    return { status: 403 };
  }

  return { status: 200, account };
}

export async function GET() {
  const resolved = await resolveAdminAccount();

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
  const resolved = await resolveAdminAccount();

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
