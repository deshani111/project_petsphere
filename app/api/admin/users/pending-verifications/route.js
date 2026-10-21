import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../../../modules/admin/admin.service";
import { listPendingVerifications } from "../../../../../../modules/admin/verifications.service";

export async function GET(request) { if (!await getCurrentAdmin()) return NextResponse.json({ message: "Admin access is required." }, { status: 403 }); try { const query = new URL(request.url).searchParams; const records = await listPendingVerifications({ search: query.get("search") || "", status: query.get("status") || "all", sort: query.get("sort") || "newest" }); return NextResponse.json({ records, total: records.length }); } catch (error) { console.error("Verification queue could not be loaded:", error); return NextResponse.json({ message: "Verification queue could not be loaded." }, { status: 500 }); } }
