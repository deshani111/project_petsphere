import { NextResponse } from "next/server";
import { getCurrentOwnerId } from "../../../../lib/session";
import { prisma } from "../../../../lib/prisma";
import type { ApprovedPublicMapLocation } from "../../../../lib/sitters/public-map-location";

export const dynamic = "force-dynamic";

export async function GET() {
  const ownerId = await getCurrentOwnerId();

  if (!ownerId) {
    return NextResponse.json(
      { message: "Please log in as a pet owner." },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const records = await prisma.pet_sitter.findMany({
    select: {
      sitter_id: true,
      bio: true,
      experience_years: true,
      service_area: true,
      is_available: true,
      is_verified: true,
      avg_rating: true,
      profile_image: true,
      users: { select: { first_name: true, last_name: true } },
      pet_sitter_service: {
        where: { is_active: true },
        select: {
          price: true,
          pricing_unit: true,
          service_type: { select: { name: true } },
        },
        orderBy: { service_type_id: "asc" },
      },
      review: { select: { rating: true } },
    },
    orderBy: [{ is_verified: "desc" }, { sitter_id: "asc" }],
  });

  const sitters = records.map((sitter) => ({
    id: sitter.sitter_id.toString(),
    name: `${sitter.users.first_name} ${sitter.users.last_name}`.trim(),
    serviceArea: sitter.service_area,
    // No public location record exists yet. In particular, profile addresses and
    // service areas are never treated as an approved map location automatically.
    publicMapLocation: null as ApprovedPublicMapLocation | null,
    profileImage: sitter.profile_image,
    isVerified: sitter.is_verified,
    isAvailable: sitter.is_available,
    rating: sitter.review.length
      ? sitter.review.reduce((total, review) => total + review.rating, 0) / sitter.review.length
      : Number(sitter.avg_rating),
    reviewCount: sitter.review.length,
    bio: sitter.bio,
    location: sitter.service_area,
    experienceYears: sitter.experience_years,
    services: sitter.pet_sitter_service.map((service) => ({
      name: service.service_type.name,
      price: Number(service.price),
      unit: service.pricing_unit,
    })),
  }));

  return NextResponse.json(
    { sitters },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
