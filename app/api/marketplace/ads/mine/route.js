import { NextResponse } from "next/server";
import { getCurrentMarketplaceSeller } from "../../../../../lib/session";
import { getSellerListings } from "../../../../../modules/marketplace/marketplace.service";

export async function GET() {
  const seller = await getCurrentMarketplaceSeller();
  if (!seller) return NextResponse.json({ message: "Please log in as a pet owner or pet sitter." }, { status: 401 });

  try {
    return NextResponse.json(await getSellerListings(seller));
  } catch (error) {
    console.error("Marketplace seller listings could not be loaded:", error);
    return NextResponse.json({ message: "Could not load your listings." }, { status: 500 });
  }
}
