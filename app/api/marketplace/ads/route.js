import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentMarketplaceSeller } from "../../../../lib/session";
import {
  createListing,
  getPublicListings,
  validateNewListing,
} from "../../../../modules/marketplace/marketplace.service";

export const runtime = "nodejs";
const IMAGE_TYPES = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"]]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function GET() {
  try {
    return NextResponse.json(await getPublicListings());
  } catch (error) {
    console.error("Marketplace listings could not be loaded:", error);
    return NextResponse.json({ message: "Could not load marketplace listings." }, { status: 500 });
  }
}

export async function POST(request) {
  const seller = await getCurrentMarketplaceSeller();
  if (!seller) return NextResponse.json({ message: "Please log in as a pet owner or pet sitter." }, { status: 401 });

  let formData;
  try { formData = await request.formData(); } catch { return NextResponse.json({ message: "Please submit a valid listing." }, { status: 400 }); }

  const input = Object.fromEntries(["description", "type", "name", "breed", "age", "gender", "location", "price"].map((key) => [key, formData.get(key)]));
  const validation = validateNewListing(input);
  if (validation.error) return NextResponse.json({ message: validation.error }, { status: 400 });

  const cover = formData.get("cover");
  const photoUrls = [];
  const savedPaths = [];
  try {
    const uploadedPhotos = formData.getAll("photos").filter((file) => file instanceof File && file.size > 0);
    if (!uploadedPhotos.length && cover instanceof File && cover.size > 0) uploadedPhotos.push(cover);
    if (!uploadedPhotos.length) return NextResponse.json({ message: "Add at least one pet photo." }, { status: 400 });
    if (uploadedPhotos.length > 6) return NextResponse.json({ message: "You can upload up to 6 photos." }, { status: 400 });
    for (const [index, photo] of uploadedPhotos.entries()) {
      const extension = IMAGE_TYPES.get(photo.type);
      if (!extension) return NextResponse.json({ message: "Photos must be JPG, PNG, or WebP." }, { status: 400 });
      if (photo.size > MAX_IMAGE_SIZE) return NextResponse.json({ message: "Each photo must be smaller than 5MB." }, { status: 400 });
      const uploadDirectory = path.join(process.cwd(), "public", "uploads", "marketplace");
      await mkdir(uploadDirectory, { recursive: true });
      const sellerId = seller.ownerId ?? seller.sitterId;
      const fileName = `${sellerId}-${randomUUID()}${extension}`;
      const savedPath = path.join(uploadDirectory, fileName);
      savedPaths.push(savedPath);
      await writeFile(savedPath, Buffer.from(await photo.arrayBuffer()));
      const url = `/uploads/marketplace/${fileName}`;
      photoUrls.push({ url, sortOrder: index });
    }
    const care = {
      vaccinated: formData.get("vaccinated") === "on" || formData.get("vaccinated") === "true",
      microchipped: formData.get("microchipped") === "on" || formData.get("microchipped") === "true",
      houseTrained: formData.get("houseTrained") === "on" || formData.get("houseTrained") === "true",
      goodWithChildren: formData.get("goodWithChildren") === "on" || formData.get("goodWithChildren") === "true",
      goodWithOtherPets: formData.get("goodWithOtherPets") === "on" || formData.get("goodWithOtherPets") === "true",
      specialCareNeeded: formData.get("specialCareNeeded") === "on" || formData.get("specialCareNeeded") === "true",
    };
    const result = await createListing({
      seller,
      values: validation.values,
      photoUrls,
      care,
    });
    return NextResponse.json({ message: "Your ad was submitted for review.", ...result }, { status: 201 });
  } catch (error) {
    await Promise.all(savedPaths.map((savedPath) => unlink(savedPath).catch(() => {})));
    console.error("Marketplace ad creation failed:", error);
    return NextResponse.json({ message: "Could not submit your ad. Please try again." }, { status: 500 });
  }
}
