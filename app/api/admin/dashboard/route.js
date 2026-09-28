import { NextResponse } from "next/server";
import { getAdminDashboardData, getCurrentAdmin } from "../../../../modules/admin/admin.service";

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  try {
    const dashboard = await getAdminDashboardData();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Admin dashboard data could not be loaded:", error);
    return NextResponse.json(
      { message: "Dashboard data could not be loaded." },
      { status: 500 }
    );
  }
}
