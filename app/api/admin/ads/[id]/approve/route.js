import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../../../modules/admin/admin.service";
import { moderateListing } from "../../../../../../modules/marketplace/marketplace.service";

export async function PATCH(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const id = (await params).id;
  const result = await moderateListing(id, admin.id, "approve");
  if (result.error) return NextResponse.json({ message: result.error }, { status: result.status });
  return NextResponse.json({ message: "Ad approved.", status: result.status });
}
