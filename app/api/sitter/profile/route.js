import { NextResponse } from "next/server";
import { getCurrentSitterProfile, updateCurrentSitterProfile } from "../../../../modules/sitter/profile/profile.service";
import { parseProfileRequest } from "../../../../modules/sitter/profile/profile.validation";

export async function GET() {
  const profile = await getCurrentSitterProfile();

  if (!profile) {
    return NextResponse.json({ success: false, error: "Sitter access is required." }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: profile, profile });
}

export async function PATCH(request) {
  const { body, files } = await parseProfileRequest(request);

  if (!body) {
    return NextResponse.json({ success: false, error: "Invalid profile data." }, { status: 400 });
  }

  const result = await updateCurrentSitterProfile(body, files);

  if (result.error) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status ?? 500 });
  }

  return NextResponse.json({ success: true, data: result.profile, profile: result.profile });
}

export const PUT = PATCH;
