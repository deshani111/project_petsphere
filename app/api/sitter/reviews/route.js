import { NextResponse } from "next/server";
import { getCurrentSitterReviews } from "../../../../modules/sitter/reviews/reviews.service";

export async function GET() {
  const data = await getCurrentSitterReviews();

  if (!data) {
    return NextResponse.json({ success: false, error: "Sitter access is required." }, { status: 401 });
  }

  return NextResponse.json({ success: true, ...data });
}