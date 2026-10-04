import { prisma } from "../../../lib/prisma";
import { getCurrentSitter } from "../sitter.service";
import { toSitterReviewsDTO } from "./reviews.dto";

function summarizeReviews(reviews) {
  const total = reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => Number(review.rating ?? 0) === rating).length,
  }));
  const averageRating = total
    ? reviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) / total
    : 0;

  const recent = reviews.slice(0, 3);
  const highlighted = reviews.find((review) => Number(review.rating ?? 0) >= 4) ?? reviews[0] ?? null;

  return {
    totalReviews: total,
    averageRating: Number(averageRating.toFixed(1)),
    ratingCounts,
    fiveStarShare: total ? Math.round((ratingCounts[0].count / total) * 100) : 0,
    recent,
    highlighted,
  };
}

export async function getCurrentSitterReviews() {
  const sitter = await getCurrentSitter();
  if (!sitter) return null;

  const reviews = await prisma.review.findMany({
    where: { sitter_id: sitter.sitter_id },
    orderBy: { review_date: "desc" },
    include: {
      booking: {
        include: {
          pet: true,
          service_type: true,
          pet_owner: {
            include: {
              users: true,
            },
          },
        },
      },
      pet_owner: {
        include: {
          users: true,
        },
      },
    },
  });

  return toSitterReviewsDTO({
    sitter: {
      name: `${sitter.users.first_name} ${sitter.users.last_name}`.trim(),
      verified: sitter.is_verified,
    },
    ...summarizeReviews(reviews),
    reviews,
  });
}