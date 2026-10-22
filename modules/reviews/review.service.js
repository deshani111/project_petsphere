import { prisma } from "../../lib/prisma";

export async function loadSitterReviews(sitterId) {
  return prisma.review.findMany({
    where: { sitter_id: sitterId },
    orderBy: { review_date: "desc" },
    include: {
      booking: {
        include: {
          pet: true,
          service_type: true,
          pet_owner: { include: { users: true } },
        },
      },
      pet_owner: { include: { users: true } },
    },
  });
}

export async function loadAdminReviews() {
  return prisma.review.findMany({
    orderBy: { review_date: "desc" },
    include: {
      booking: { include: { service_type: { select: { name: true } } } },
      pet_owner: {
        include: { users: { select: { first_name: true, last_name: true, full_name: true } } },
      },
      pet_sitter: {
        include: { users: { select: { first_name: true, last_name: true, full_name: true } } },
      },
    },
  });
}
