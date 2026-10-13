import { prisma } from "../lib/prisma.js";

const REVIEW_COMMENTS = [
  "Responsive, polite, and clearly attentive to the pet’s routine.",
  "Followed instructions carefully and kept great communication throughout.",
  "Very reliable sitter with a calm, reassuring approach.",
  "The pet came back happy, clean, and clearly well cared for.",
  "Punctual, thoughtful, and easy to coordinate with from start to finish.",
  "Handled everything professionally and gave timely updates.",
  "A smooth experience with excellent care and attention to detail.",
];

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function randomComment(index) {
  return REVIEW_COMMENTS[index % REVIEW_COMMENTS.length];
}

async function seedReviews() {
  const existingCount = await prisma.review.count();

  if (existingCount > 0) {
    console.log("Review seed skipped because reviews already exist.");
    return;
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { booking_id: "asc" },
    select: {
      booking_id: true,
      owner_id: true,
      sitter_id: true,
    },
  });

  if (!bookings.length) {
    throw new Error("At least one booking is required to seed reviews.");
  }

  for (let index = 0; index < 142; index += 1) {
    const booking = bookings[index % bookings.length];

    await prisma.review.create({
      data: {
        booking_id: booking.booking_id,
        owner_id: booking.owner_id,
        sitter_id: booking.sitter_id,
        rating: (index % 5) + 1,
        comment: randomComment(index),
        review_date: daysAgo(index % 142),
      },
    });
  }

  console.log("Seeded 142 reviews for development.");
}

seedReviews()
  .catch((error) => {
    console.error("Review seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
