import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../../modules/admin/admin.service";
import {
  deleteAdminBlogPost,
  getAdminBlogPostById,
  parseAdminBlogId,
  updateAdminBlogPost,
} from "../../../../../modules/admin/blog.service";

export async function GET(_request, { params }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const blogId = parseAdminBlogId(params.blogId);

  if (!blogId) {
    return NextResponse.json({ message: "A valid blog ID is required." }, { status: 400 });
  }

  try {
    const blog = await getAdminBlogPostById(blogId);

    if (!blog) {
      return NextResponse.json({ message: "Blog post not found." }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Admin blog details could not be loaded:", error);
    return NextResponse.json(
      { message: "Blog data could not be loaded." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const blogId = parseAdminBlogId(params.blogId);

  if (!blogId) {
    return NextResponse.json({ message: "A valid blog ID is required." }, { status: 400 });
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
    const blog = await updateAdminBlogPost(blogId, body);

    if (!blog) {
      return NextResponse.json({ message: "Blog post not found." }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Admin blog update failed:", error);
    return NextResponse.json(
      { message: error.message || "Blog data could not be updated." },
      { status: 400 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const blogId = parseAdminBlogId(params.blogId);

  if (!blogId) {
    return NextResponse.json({ message: "A valid blog ID is required." }, { status: 400 });
  }

  try {
    const deleted = await deleteAdminBlogPost(blogId);

    if (!deleted) {
      return NextResponse.json({ message: "Blog post not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog post deleted." });
  } catch (error) {
    console.error("Admin blog deletion failed:", error);
    return NextResponse.json(
      { message: "Blog data could not be deleted." },
      { status: 500 }
    );
  }
}
