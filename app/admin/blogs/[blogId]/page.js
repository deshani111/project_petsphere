import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminBlogPostById, parseAdminBlogId } from "../../../../modules/admin/blog.service";
import styles from "./page.module.css";

function Icon({ name }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 14 14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "back":
      return <svg {...common}><path d="M8.8 2.2 4 7l4.8 4.8" /><path d="M4.5 7h7.3" /></svg>;
    case "edit":
      return <svg {...common}><path d="M2.3 11.7h2.8L11.9 4.9 9.1 2.1 2.3 8.9v2.8Z" /><path d="m8.3 3 2.8 2.8" /></svg>;
    default:
      return null;
  }
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function splitContent(content) {
  const blocks = String(content || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return [{ heading: "Article Overview", body: "No article body has been added yet." }];
  }

  return blocks.flatMap((block, index) => {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const headingMatch = lines[0]?.match(/^(\d+)\.\s*(.+)$/);

    if (headingMatch) {
      return [{
        heading: headingMatch[2],
        body: lines.slice(1).join(" ") || "This section has not been expanded yet.",
      }];
    }

    if (index === 0 && blocks.length > 1) {
      return [{ heading: null, body: block }];
    }

    return [{
      heading: index === 0 ? "Article Overview" : null,
      body: block,
    }];
  });
}

function formatLongDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AdminBlogDetailPage({ params }) {
  const blogId = parseAdminBlogId(params.blogId);

  if (!blogId) {
    notFound();
  }

  const blog = await getAdminBlogPostById(blogId);

  if (!blog) {
    notFound();
  }

  const sections = splitContent(blog.content);
  const authorName = blog.author || "Unknown Author";
  const authorRole = blog.primaryTag || blog.category || "Blog Author";

  return (
    <section className={styles.page}>
      <div className={styles.topLine}>
        <div className={styles.metaRow}>
          <span className={`${styles.status} ${styles[blog.status] || ""}`}>{blog.status}</span>
          <span>{blog.date}</span>
        </div>
        <Link href={`/admin/blogs/new?blogId=${blog.id}`} className={styles.editButton}>
          <Icon name="edit" />
          Edit Article
        </Link>
      </div>

      <header className={styles.header}>
        <Link href="/admin/blogs" className={styles.backButton} aria-label="Back to blog management">
          <Icon name="back" />
        </Link>
        <div>
          <h1>{blog.title}</h1>
          <div className={styles.authorRow}>
            <span className={styles.authorAvatar}>{initials(authorName)}</span>
            <div>
              <strong>{authorName}</strong>
              <small>{authorRole}</small>
            </div>
          </div>
        </div>
      </header>

      <article className={styles.heroCard}>
        <img src={blog.image} alt={blog.title} />
      </article>

      <article className={styles.contentCard}>
        {blog.excerpt && <p className={styles.lead}>{blog.excerpt}</p>}
        {sections.map((section, index) => (
          <section key={`${blog.id}-${index}`} className={styles.sectionBlock}>
            {section.heading && <h2>{section.heading}</h2>}
            <p>{section.body}</p>
          </section>
        ))}
      </article>

      <footer className={styles.footer}>
        <div>
          <strong>Published on</strong>
          <span>{formatLongDate(blog.createdAt)}</span>
        </div>
        <div>
          <strong>Category</strong>
          <span>{blog.category}</span>
        </div>
        <div>
          <strong>Read time</strong>
          <span>{blog.readTimeLabel}</span>
        </div>
      </footer>
    </section>
  );
}
