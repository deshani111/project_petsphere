import { prisma } from "../../lib/prisma";

const SORTERS = {
  newest: (a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime(),
  oldest: (a, b) => new Date(a.review_date).getTime() - new Date(b.review_date).getTime(),
  rating_high: (a, b) => b.rating - a.rating || new Date(b.review_date).getTime() - new Date(a.review_date).getTime(),
  rating_low: (a, b) => a.rating - b.rating || new Date(b.review_date).getTime() - new Date(a.review_date).getTime(),
};

function toStringId(value) {
  return typeof value === "bigint" ? value.toString() : String(value);
}

function clampSort(sort) {
  return SORTERS[sort] ? sort : "newest";
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatName(user) {
  if (!user) return "Unknown";
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.full_name || "Unknown";
}

function buildAvatar(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function mapReview(review) {
  const ownerName = formatName(review.pet_owner?.users);
  const sitterName = formatName(review.pet_sitter?.users);
  const rating = Number(review.rating || 0);

  return {
    id: toStringId(review.review_id),
    reviewId: `#REV-${String(review.review_id).padStart(4, "0")}`,
    ownerName,
    sitterName,
    ownerAvatar: buildAvatar(ownerName),
    sitterAvatar: buildAvatar(sitterName),
    rating,
    ratingLabel: rating.toFixed(1),
    comment: review.comment || "",
    displayDate: formatDate(review.review_date),
    createdAt: review.review_date.toISOString(),
    bookingId: review.booking_id ? toStringId(review.booking_id) : "",
    serviceType: review.booking?.service_type?.name || "Service",
  };
}

async function loadReviews() {
  return prisma.review.findMany({
    orderBy: {
      review_date: "desc",
    },
    include: {
      booking: {
        include: {
          service_type: {
            select: {
              name: true,
            },
          },
        },
      },
      pet_owner: {
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              full_name: true,
            },
          },
        },
      },
      pet_sitter: {
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              full_name: true,
            },
          },
        },
      },
    },
  });
}

export async function getAdminReviewsData({ search = "", rating = "all", sort = "newest" } = {}) {
  const selectedSort = clampSort(sort);
  const reviewRows = await loadReviews();
  const searchTerm = String(search || "").trim().toLowerCase();
  const minRating = rating === "all" ? 0 : Number(rating || 0);

  const filtered = reviewRows.filter((review) => {
    const mapped = mapReview(review);
    const haystack = `${mapped.reviewId} ${mapped.ownerName} ${mapped.sitterName} ${mapped.serviceType} ${mapped.comment}`.toLowerCase();
    return (!searchTerm || haystack.includes(searchTerm)) && (!minRating || mapped.rating >= minRating);
  });

  const reviews = filtered.map(mapReview).sort(SORTERS[selectedSort]);
  const total = reviewRows.length;
  const averageRating = total ? reviewRows.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total : 0;

  return {
    totalReviews: total,
    averageRating: Number(averageRating.toFixed(1)),
    reviews,
  };
}
