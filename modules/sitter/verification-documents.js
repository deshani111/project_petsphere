import { mkdir, readdir, rm, writeFile } from "fs/promises";
import path from "path";

export const VERIFICATION_DOCUMENT_TYPES = ["nic_front", "nic_back", "selfie_with_nic"];
export const MAX_VERIFICATION_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function isVerificationDocumentType(type) {
  return VERIFICATION_DOCUMENT_TYPES.includes(type);
}

export function verificationDocumentUrl(type) {
  return `/api/sitter/profile/verification-documents/${type}`;
}

export function getVerificationStatus(sitter) {
  if (sitter.is_verified) return "Verified";

  const submittedTypes = new Set(
    (sitter.verification_documents ?? []).map((document) => document.document_type)
  );

  return VERIFICATION_DOCUMENT_TYPES.every((type) => submittedTypes.has(type))
    ? "Pending"
    : "Not Submitted";
}

export function verificationStorageDir() {
  return path.join(process.cwd(), "storage", "identity-verification");
}

function verificationFilePrefix(sitterId, type) {
  return `sitter_${sitterId}_${type}.`;
}

export async function findVerificationFile(sitterId, type) {
  if (!isVerificationDocumentType(type)) return null;

  const directory = verificationStorageDir();
  const prefix = verificationFilePrefix(sitterId, type);
  const files = await readdir(directory).catch(() => []);
  const file = files.find((name) => name.startsWith(prefix));

  return file ? path.join(directory, file) : null;
}

export async function saveVerificationFile({ sitterId, type, file }) {
  if (!isVerificationDocumentType(type)) {
    throw new Error("Invalid verification document type.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WEBP image.");
  }

  if (file.size > MAX_VERIFICATION_IMAGE_SIZE) {
    throw new Error("Image must be less than 5MB.");
  }

  const directory = verificationStorageDir();
  await mkdir(directory, { recursive: true });

  const prefix = verificationFilePrefix(sitterId, type);
  const existingFiles = await readdir(directory).catch(() => []);

  await Promise.all(
    existingFiles
      .filter((name) => name.startsWith(prefix))
      .map((name) => rm(path.join(directory, name), { force: true }))
  );

  const extension = ALLOWED_IMAGE_TYPES.get(file.type);
  const filePath = path.join(directory, `${prefix}${extension}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return verificationDocumentUrl(type);
}
