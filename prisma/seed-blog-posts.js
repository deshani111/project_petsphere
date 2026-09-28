import { prisma } from "../lib/prisma.js";

const SAMPLE_BLOGS = [
  {
    title: "Essential Training",
    content:
      "A practical training guide for new pet parents. Focus on short sessions, clear cues, and positive reinforcement to build confidence and trust.",
    metadata: {
      category: "Training",
      status: "published",
      excerpt: "Short training sessions and positive reinforcement build trust.",
      image: "/blog-training.jpg",
      views: 1200,
      readTimeMinutes: 5,
    },
  },
  {
    title: "The Ultimate Guide",
    content:
      "Nutrition basics for busy pet families. Learn how to balance portions, choose quality ingredients, and recognize when your pet needs a dietary change.",
    metadata: {
      category: "Nutrition",
      status: "draft",
      excerpt: "Balance portions and choose quality ingredients with confidence.",
      image: "/blog-dog-health.jpg",
      views: 850,
      readTimeMinutes: 8,
    },
  },
  {
    title: "Understanding Cat Behavior",
    content:
      "Cats communicate through posture, motion, and sound. This guide helps readers interpret body language, stress cues, and playful signals.",
    metadata: {
      category: "Behavior",
      status: "published",
      excerpt: "Learn how to read posture, motion, and subtle feline signals.",
      image: "/blog-cat-behavior.jpg",
      views: 2400,
      readTimeMinutes: 12,
    },
  },
  {
    title: "Common Seasonal Wellness Tips",
    content:
      "Seasonal care changes with weather, pollen, and routine. These wellness tips help pet parents stay ahead of common environmental triggers.",
    metadata: {
      category: "Health",
      status: "published",
      excerpt: "Stay ahead of common environmental triggers throughout the year.",
      image: "/blog-dog-health.jpg",
      views: 3100,
      readTimeMinutes: 7,
    },
  },
  {
    title: "DIY Grooming Basics",
    content:
      "A gentle grooming routine can make pets more comfortable at home. This article covers brushing, bathing, and trimming without the stress.",
    metadata: {
      category: "Grooming",
      status: "draft",
      excerpt: "Make brushing, bathing, and trimming feel less stressful at home.",
      image: "/blog-featured-puppy.jpg",
      views: 540,
      readTimeMinutes: 10,
    },
  },
];

async function seedBlogPosts() {
  const adminUser = await prisma.users.findFirst({
    where: { role: "admin" },
    select: { user_id: true, first_name: true, last_name: true, email: true },
  });

  if (!adminUser) {
    throw new Error("No admin user was found. Create a development admin account first.");
  }

  for (const blog of SAMPLE_BLOGS) {
    const existing = await prisma.blog_post.findFirst({
      where: { title: blog.title },
      select: { blog_id: true },
    });

    if (existing) {
      console.log(`Skipped existing blog post: ${blog.title}`);
      continue;
    }

    await prisma.blog_post.create({
      data: {
        author_user_id: adminUser.user_id,
        title: blog.title,
        content: blog.content,
        medical_notes: JSON.stringify(blog.metadata),
      },
    });

    console.log(`Seeded blog post: ${blog.title}`);
  }
}

seedBlogPosts()
  .catch((error) => {
    console.error("Blog seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
