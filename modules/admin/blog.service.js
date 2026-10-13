import { prisma } from "../../lib/prisma";

const DEFAULT_IMAGES = [
  "/blog-training.jpg",
  "/blog-dog-health.jpg",
  "/blog-cat-behavior.jpg",
  "/blog-featured-puppy.jpg",
];

const CATEGORY_HINTS = [
  ["Training", ["training", "obedience", "behavior", "positive reinforcement"]],
  ["Nutrition", ["nutrition", "feeding", "diet", "meal", "allergy"]],
  ["Behavior", ["behavior", "body language", "anxiety", "stress"]],
  ["Health", ["health", "wellness", "medical", "seasonal", "vaccin"]],
  ["Grooming", ["groom", "bath", "coat", "fur"]],
  ["Owner Guides", ["owner", "adopt", "guide", "family", "care"]],
];

function toStringId(value) {
  return typeof value === "bigint" ? value.toString() : String(value);
}

function parseMetadata(value) {
  if (typeof value !== "string" || !value.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeStatus(value) {
  return value === "draft" ? "draft" : "published";
}

function sanitizeCategory(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function estimateReadTime(content) {
  const words = (content || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 220));
}

function summarizeContent(content) {
  const text = (content || "").replace(/\s+/g, " ").trim();

  if (!text) {
    return "Draft content will appear here once the article body is added.";
  }

  return text.length > 145 ? `${text.slice(0, 142).trimEnd()}...` : text;
}

function inferCategory(title, content) {
  const haystack = `${title || ""} ${content || ""}`.toLowerCase();

  for (const [category, keywords] of CATEGORY_HINTS) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      return category;
    }
  }

  return "General";
}

function chooseImage(category, title) {
  const source = `${category || ""} ${title || ""}`.toLowerCase();

  if (source.includes("cat")) {
    return "/blog-cat-behavior.jpg";
  }

  if (source.includes("groom")) {
    return "/blog-training.jpg";
  }

  if (source.includes("health") || source.includes("nutrition")) {
    return "/blog-dog-health.jpg";
  }

  return DEFAULT_IMAGES[Math.abs(source.length) % DEFAULT_IMAGES.length];
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getAuthorName(user) {
  if (!user) {
    return "Unknown Author";
  }

  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return fullName || user.full_name || "Unknown Author";
}

function mapBlogPost(post) {
  const metadata = parseMetadata(post.medical_notes);
  const content = post.content || "";
  const title = post.title || "";
  const category = sanitizeCategory(metadata.category) || inferCategory(title, content);
  const status = normalizeStatus(metadata.status);
  const image = typeof metadata.image === "string" && metadata.image.trim()
    ? metadata.image.trim()
    : chooseImage(category, title);
  const readTimeMinutes = Number(metadata.readTimeMinutes) || estimateReadTime(content);
  const views = Number(metadata.views) || 0;
  const excerpt =
    typeof metadata.excerpt === "string" && metadata.excerpt.trim()
      ? metadata.excerpt.trim()
      : summarizeContent(content);

  return {
    id: toStringId(post.blog_id),
    title,
    content,
    category,
    status,
    excerpt,
    image,
    views,
    readTimeMinutes,
    readTimeLabel: `${readTimeMinutes} min read`,
    date: formatDate(post.created_date),
    createdAt: post.created_date.toISOString(),
    author: getAuthorName(post.users),
    authorId: post.author_user_id ? toStringId(post.author_user_id) : "",
    primaryTag: typeof metadata.primaryTag === "string" ? metadata.primaryTag : "",
  };
}

function normalizeBlogInput(body = {}) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const metadata =
    body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? body.metadata
      : {};
  const category = sanitizeCategory(
    typeof body.category === "string" ? body.category : metadata.category
  );
  const status = normalizeStatus(
    typeof body.status === "string" ? body.status.toLowerCase() : metadata.status
  );
  const primaryTag =
    typeof body.primaryTag === "string" && body.primaryTag.trim()
      ? body.primaryTag.trim()
      : typeof metadata.primaryTag === "string"
        ? metadata.primaryTag.trim()
        : "";
  const excerpt =
    typeof body.excerpt === "string" && body.excerpt.trim()
      ? body.excerpt.trim()
      : typeof metadata.excerpt === "string"
        ? metadata.excerpt.trim()
        : "";
  const image =
    typeof body.image === "string" && body.image.trim()
      ? body.image.trim()
      : typeof metadata.image === "string"
        ? metadata.image.trim()
        : "";
  const viewsValue =
    typeof body.views === "number"
      ? body.views
      : typeof body.views === "string" && body.views.trim()
        ? Number(body.views)
        : metadata.views;
  const readTimeValue =
    typeof body.readTimeMinutes === "number"
      ? body.readTimeMinutes
      : typeof body.readTimeMinutes === "string" && body.readTimeMinutes.trim()
        ? Number(body.readTimeMinutes)
        : metadata.readTimeMinutes;

  return {
    title,
    content,
    metadata: {
      category: category || inferCategory(title, content),
      status,
      primaryTag,
      excerpt: excerpt || summarizeContent(content),
      image: image || chooseImage(category || inferCategory(title, content), title),
      views: Number.isFinite(viewsValue) ? Math.max(0, Math.floor(viewsValue)) : 0,
      readTimeMinutes: Number.isFinite(readTimeValue)
        ? Math.max(1, Math.floor(readTimeValue))
        : estimateReadTime(content),
    },
  };
}

async function findBlogPostOrNull(blogId) {
  return prisma.blog_post.findUnique({
    where: { blog_id: blogId },
    include: {
      users: {
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          full_name: true,
        },
      },
    },
  });
}

export async function getAdminBlogPostById(blogId) {
  const post = await findBlogPostOrNull(blogId);
  return post ? mapBlogPost(post) : null;
}

export async function listAdminBlogPosts({ search = "", status = "all", category = "all" } = {}) {
  const posts = await prisma.blog_post.findMany({
    orderBy: { created_date: "desc" },
    include: {
      users: {
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          full_name: true,
        },
      },
    },
  });

  const searchValue = search.trim().toLowerCase();
  const statusValue = status.trim().toLowerCase();
  const categoryValue = category.trim().toLowerCase();

  return posts
    .map(mapBlogPost)
    .filter((post) => {
      if (statusValue !== "all" && post.status !== statusValue) {
        return false;
      }

      if (categoryValue !== "all" && post.category.toLowerCase() !== categoryValue) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return [
        post.title,
        post.category,
        post.status,
        post.excerpt,
        post.author,
        post.content,
      ].some((value) => value.toLowerCase().includes(searchValue));
    });
}

export async function createAdminBlogPost({ authorUserId, ...body }) {
  const adminUserId = BigInt(authorUserId);
  const { title, content, metadata } = normalizeBlogInput(body);

  if (!title) {
    throw new Error("A blog title is required.");
  }

  const createdPost = await prisma.blog_post.create({
    data: {
      author_user_id: adminUserId,
      title,
      content,
      medical_notes: JSON.stringify(metadata),
    },
    include: {
      users: {
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          full_name: true,
        },
      },
    },
  });

  return mapBlogPost(createdPost);
}

export async function updateAdminBlogPost(blogId, body) {
  const existingPost = await findBlogPostOrNull(blogId);

  if (!existingPost) {
    return null;
  }

  const { title, content, metadata } = normalizeBlogInput({
    title: body.title ?? existingPost.title,
    content: body.content ?? existingPost.content ?? "",
    category: body.category,
    primaryTag: body.primaryTag,
    status: body.status,
    excerpt: body.excerpt,
    image: body.image,
    views: body.views,
    readTimeMinutes: body.readTimeMinutes,
    metadata: parseMetadata(existingPost.medical_notes),
  });

  if (!title) {
    throw new Error("A blog title is required.");
  }

  const updatedPost = await prisma.blog_post.update({
    where: { blog_id: blogId },
    data: {
      title,
      content,
      medical_notes: JSON.stringify(metadata),
    },
    include: {
      users: {
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          full_name: true,
        },
      },
    },
  });

  return mapBlogPost(updatedPost);
}

export async function deleteAdminBlogPost(blogId) {
  const existingPost = await findBlogPostOrNull(blogId);

  if (!existingPost) {
    return false;
  }

  await prisma.blog_post.delete({
    where: { blog_id: blogId },
  });

  return true;
}

export function parseAdminBlogId(value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  try {
    const parsed = BigInt(value);
    return parsed > 0n ? parsed : null;
  } catch {
    return null;
  }
}
