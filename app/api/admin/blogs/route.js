import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../modules/admin/admin.service";
import { createAdminBlogPost, listAdminBlogPosts } from "../../../../modules/admin/blog.service";

export async function GET(request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const blogs = await listAdminBlogPosts({
      search: url.searchParams.get("search") || "",
      status: url.searchParams.get("status") || "all",
      category: url.searchParams.get("category") || "all",
    });

    return NextResponse.json({
      blogs,
      total: blogs.length,
    });
  } catch (error) {
    console.error("Admin blog list could not be loaded:", error);
    return NextResponse.json(
      { message: "Blog data could not be loaded." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Please submit valid blog details." },
      { status: 400 }
    );
  }

  try {
    const blog = await createAdminBlogPost({
      ...body,
      authorUserId: admin.id,
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error("Admin blog creation failed:", error);
    return NextResponse.json(
      { message: error.message || "Blog data could not be saved." },
      { status: 400 }
    );
  }
}
