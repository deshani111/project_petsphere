import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getCurrentSitter } from "../../../../../../modules/sitter/sitter.service";
import {
  findVerificationFile,
  isVerificationDocumentType,
} from "../../../../../../modules/sitter/verification-documents";

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_request, { params }) {
  const sitter = await getCurrentSitter();
  const { type } = await params;

  if (!sitter) {
    return NextResponse.json(
      { success: false, error: "Sitter access is required." },
      { status: 401 }
    );
  }

  if (!isVerificationDocumentType(type)) {
    return NextResponse.json(
      { success: false, error: "Verification document was not found." },
      { status: 404 }
    );
  }

  const filePath = await findVerificationFile(sitter.sitter_id, type);

  if (!filePath) {
    return NextResponse.json(
      { success: false, error: "Verification document was not found." },
      { status: 404 }
    );
  }

  const file = await readFile(filePath).catch(() => null);

  if (!file) {
    return NextResponse.json(
      { success: false, error: "Verification document was not found." },
      { status: 404 }
    );
  }

  return new NextResponse(file, {
    headers: {
      "Content-Type": CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}
