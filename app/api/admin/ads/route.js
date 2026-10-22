import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../modules/admin/admin.service";
import {
  AD_STATUSES,
  getAdminApprovalListings,
} from "../../../../modules/marketplace/marketplace.service";

export async function GET(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Admin access required." }, { status: 403 });

  const status = new URL(request.url).searchParams.get("status") || "pending";
  if (!AD_STATUSES.includes(status)) {
    return NextResponse.json({ message: "Invalid ad status." }, { status: 400 });
  }
  return NextResponse.json(await getAdminApprovalListings(status));
}
