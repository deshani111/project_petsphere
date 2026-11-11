import { NextResponse } from "next/server";
import { getCurrentSitterProfile, updateCurrentSitterProfile } from "../../../../modules/sitter/profile/profile.service";
import { parseProfileRequest } from "../../../../modules/sitter/profile/profile.validation";

export async function GET() {
  try {
    const profile = await getCurrentSitterProfile();

    if (!profile) {
      return NextResponse.json({ success: false, error: "Sitter access is required." }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: profile, profile });
  } catch (error) {
    console.error("Sitter profile read failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load your profile right now." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { body, files, profileImage } = await parseProfileRequest(request);

    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid profile data." }, { status: 400 });
    }

    const result = await updateCurrentSitterProfile(body, files, profileImage);

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status ?? 500 });
    }

    return NextResponse.json({ success: true, data: result.profile, profile: result.profile });
  } catch (error) {
    console.error("Sitter profile update failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to save your profile right now." },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;
