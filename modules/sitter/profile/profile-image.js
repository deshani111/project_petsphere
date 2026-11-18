import { mkdir, readdir, rm, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

export async function saveProfileImage({ sitterId, file }) {
  const extension = ALLOWED_IMAGE_TYPES.get(file?.type);
  if (!extension) {
    throw new Error("Please upload a JPG, PNG, or WEBP profile image.");
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    throw new Error("Profile image must be less than 5MB.");
  }

  const directory = path.join(process.cwd(), "public", "uploads", "sitters");
  await mkdir(directory, { recursive: true });

  const prefix = `sitter_${sitterId}_profile.`;
  const existingFiles = await readdir(directory).catch(() => []);
  await Promise.all(
    existingFiles
      .filter((name) => name.startsWith(prefix))
      .map((name) => rm(path.join(directory, name), { force: true }))
  );

  await writeFile(
    path.join(directory, `${prefix}${extension}`),
    Buffer.from(await file.arrayBuffer())
  );

  return `/uploads/sitters/${prefix}${extension}`;
}
