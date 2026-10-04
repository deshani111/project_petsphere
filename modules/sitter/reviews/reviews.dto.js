import { serialize } from "../sitter.service";

function reviewerName(review) {
  const first = review.pet_owner?.users?.first_name ?? review.booking?.pet_owner?.users?.first_name ?? "";
  const last = review.pet_owner?.users?.last_name ?? review.booking?.pet_owner?.users?.last_name ?? "";
  return `${first} ${last}`.trim() || "Verified guest";
}

export function toSitterReviewDTO(review) {
  return {
    id: review.review_id.toString(),
    rating: Number(review.rating ?? 0),
    comment: review.comment ?? "",
    reviewDate: review.review_date,
    reviewer: reviewerName(review),
    reviewerInitials: reviewerName(review)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "VG",
    pet: {
      name: review.booking?.pet?.pet_name ?? "Pet",
      species: review.booking?.pet?.species ?? "",
      breed: review.booking?.pet?.breed ?? "",
    },
    service: review.booking?.service_type?.name ?? "Pet care",
    bookingId: review.booking_id ? review.booking_id.toString() : null,
    ownerId: review.owner_id ? review.owner_id.toString() : null,
  };
}

export function toSitterReviewsDTO(payload) {
  return serialize({
    ...payload,
    reviews: payload.reviews.map(toSitterReviewDTO),
  });
}