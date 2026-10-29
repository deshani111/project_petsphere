import { NextResponse } from "next/server";
import { getCurrentMarketplaceSeller } from "../../../../../lib/session";
import { getCurrentAdmin } from "../../../../../modules/admin/admin.service";
import {
  deleteSellerListing,
  getListingById,
  serializeListingDetail,
  updateSellerListing,
} from "../../../../../modules/marketplace/marketplace.service";

export async function GET(request, { params }) {
  const id = (await params).id;
  const editMode = new URL(request.url).searchParams.get("mode") === "edit";
  const ad = await getListingById(id, { includeUnpublished: editMode });
  if (!ad) return NextResponse.json({ message: "Ad not found." }, { status: 404 });

  if (editMode) {
    const admin = await getCurrentAdmin();
    const seller = await getCurrentMarketplaceSeller();
    const author = seller && ((seller.ownerId && ad.owner_id === seller.ownerId) || (seller.sitterId && ad.sitter_id === seller.sitterId));
    if (!admin && !author) return NextResponse.json({ message: "Ad not found." }, { status: 404 });
  }

  return NextResponse.json(serializeListingDetail(ad, !editMode));
}

export async function PUT(request, { params }) {
  const seller = await getCurrentMarketplaceSeller();
  if (!seller) return NextResponse.json({ message: "Please log in as a pet owner or pet sitter." }, { status: 401 });

  const id = (await params).id;
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: "Invalid ad." }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid listing data." }, { status: 400 });
  }

  try {
    const result = await updateSellerListing(id, seller, body);
    if (!result) return NextResponse.json({ message: "Ad not found or you do not own it." }, { status: 404 });
    if (result.error) return NextResponse.json({ message: result.error }, { status: 400 });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Marketplace ad update failed:", error);
    return NextResponse.json({ message: "Could not update your ad. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const seller = await getCurrentMarketplaceSeller();
  if (!seller) return NextResponse.json({ message: "Please log in as a pet owner or pet sitter." }, { status: 401 });

  const id = (await params).id;
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: "Invalid ad." }, { status: 400 });

  try {
    const deleted = await deleteSellerListing(id, seller);
    if (!deleted) return NextResponse.json({ message: "Ad was not found or you do not own it." }, { status: 404 });
    return NextResponse.json({ message: "Your ad was deleted." });
  } catch (error) {
    if (error?.code === "P2003") {
      return NextResponse.json({ message: "This ad cannot be deleted because it has related records." }, { status: 409 });
    }
    console.error("Marketplace ad deletion failed:", error);
    return NextResponse.json({ message: "Could not delete your ad. Please try again." }, { status: 500 });
  }
}
