import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../../../modules/admin/admin.service";
import { moderateListing } from "../../../../../../modules/marketplace/marketplace.service";

export async function PATCH(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const id = (await params).id;
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: "Invalid ad." }, { status: 400 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 1000) : "";
  const result = await moderateListing(id, admin.id, "reject", reason);
  if (result.error) return NextResponse.json({ message: result.error }, { status: result.status });
  return NextResponse.json({ message: "Ad rejected.", status: result.status });
}
