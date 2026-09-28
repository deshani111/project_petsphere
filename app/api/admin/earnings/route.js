import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../modules/admin/admin.service";
import { getAdminEarningsData } from "../../../../modules/admin/earnings.service";

export async function GET(request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "this_month";
    const earnings = await getAdminEarningsData(period);
    return NextResponse.json(earnings);
  } catch (error) {
    console.error("Admin earnings data could not be loaded:", error);
    return NextResponse.json(
      { message: "Earnings data could not be loaded." },
      { status: 500 }
    );
  }
}
