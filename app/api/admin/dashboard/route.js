import { NextResponse } from "next/server";
import { getAdminDashboardData, getCurrentAdmin } from "../../../../modules/admin/admin.service";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
    }

    const dashboard = await getAdminDashboardData();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Admin dashboard request failed:", error);

    if (["P1000", "P1001", "P1002", "P1003", "P1017", "P2024"].includes(error?.code) || error?.name === "PrismaClientInitializationError") {
      return NextResponse.json(
        {
          code: "DATABASE_UNAVAILABLE",
          message: "Dashboard data is temporarily unavailable because the database connection failed.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Dashboard data could not be loaded." },
      { status: 500 }
    );
  }
}
