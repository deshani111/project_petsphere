import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../modules/admin/admin.service";
import { createAdminUser, listAdminUsers } from "../../../../modules/admin/users.service";

export async function GET(request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access is required." },
        { status: 403 },
      );
    }

    const query = new URL(request.url).searchParams;
    return NextResponse.json(await listAdminUsers({
      page: query.get("page"), pageSize: query.get("pageSize"), search: query.get("search") || "",
      role: query.get("role") || "all", status: query.get("status") || "all", sort: query.get("sort") || "joined",
    }));
  } catch (error) {
    console.error("Admin users data could not be loaded:", error);

    if (
      ["P1000", "P1001", "P1002", "P1003", "P1017", "P2024"].includes(error?.code) ||
      error?.name === "PrismaClientInitializationError"
    ) {
      return NextResponse.json(
        {
          code: "DATABASE_UNAVAILABLE",
          message: "Users data is temporarily unavailable because the database connection failed.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { message: "Users data could not be loaded." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  if (!await getCurrentAdmin()) return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Please submit valid user details." }, { status: 400 });
  try { return NextResponse.json({ user: await createAdminUser(body) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ message: error?.code === "P2002" ? "An account with this email already exists." : error.message || "User could not be created." }, { status: 400 }); }
}
