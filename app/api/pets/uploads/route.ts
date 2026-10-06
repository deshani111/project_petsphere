import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentOwnerId } from "../../../../lib/session";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["application/pdf", ".pdf"],
]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const ownerId = await getCurrentOwnerId();

  if (!ownerId) {
    return NextResponse.json({ message: "Please log in as a pet owner." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Please select a file." }, { status: 400 });
    }

    const extension = ALLOWED_TYPES.get(file.type);
    if (!extension) {
      return NextResponse.json(
        { message: "Only JPEG, PNG, WEBP, or PDF files are allowed." },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: "The file must be smaller than 5MB." },
        { status: 400 }
      );
    }

    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "pets");
    await mkdir(uploadDirectory, { recursive: true });

    const fileName = `${ownerId}-${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ url: `/uploads/pets/${fileName}` }, { status: 201 });
  } catch (error) {
    console.error("Pet file upload failed:", error);
    return NextResponse.json(
      { message: "Could not upload the file. Please try again." },
      { status: 500 }
    );
  }
}
