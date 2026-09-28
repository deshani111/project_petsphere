import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../modules/admin/admin.service";
import { getAdminReviewsData } from "../../../../modules/admin/reviews.service";

export async function GET(request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const rating = url.searchParams.get("rating") || "all";
    const sort = url.searchParams.get("sort") || "newest";
    const reviews = await getAdminReviewsData({ search, rating, sort });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Admin reviews data could not be loaded:", error);
    return NextResponse.json({ message: "Reviews data could not be loaded." }, { status: 500 });
  }
}
