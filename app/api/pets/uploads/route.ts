import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentOwnerId } from "../../../../lib/session";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const ownerId = await getCurrentOwnerId();

  if (!ownerId) {
    return NextResponse.json({ message: "Please log in as a pet owner." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "Please select an image file." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Only JPEG, PNG, WEBP, or PDF files are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: "Image must be smaller than 5MB." },
        { status: 400 }
      );
    }

    const blob = await put(`pets/${ownerId}-${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    console.error("Pet photo upload failed:", error);
    return NextResponse.json(
      { message: "Could not upload image. Please try again." },
      { status: 500 }
    );
  }
}
