import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../modules/admin/admin.service";
import {
  AD_STATUSES,
  getAdminListings,
  moderateListing,
} from "../../../../modules/marketplace/marketplace.service";

export async function GET(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Admin access required." }, { status: 403 });

  const requestedStatus = new URL(request.url).searchParams.get("status") || "pending";
  if (requestedStatus !== "all" && !AD_STATUSES.includes(requestedStatus)) {
    return NextResponse.json({ message: "Invalid ad status." }, { status: 400 });
  }
  return NextResponse.json(await getAdminListings(requestedStatus));
}

export async function PATCH(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Admin access required." }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  const validId = typeof body.id === "string" && /^\d+$/.test(body.id);
  const decision = body.status === "approve" || body.status === "reject" ? body.status : null;
  if (!validId || !decision) {
    return NextResponse.json({ message: "Provide a valid ad and moderation decision." }, { status: 400 });
  }
  const result = await moderateListing(body.id, admin.id, decision, typeof body.reason === "string" ? body.reason : "");
  if (result.error) return NextResponse.json({ message: result.error }, { status: result.status });
  return NextResponse.json({ message: result.status === "approved" ? "Ad approved." : "Ad rejected.", status: result.status });
}
