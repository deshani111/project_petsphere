"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { blogPosts, getClientPosts, subscribeToBlogPosts } from "../../../../lib/blog-data";
import styles from "./page.module.css";

function SafeImage({ src, alt, fallback, fill, width, height, priority = false, sizes, loading }) {
  const [imageSrc, setImageSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={styles.imageFallback} role="img" aria-label={alt}>{alt}</div>;
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      loading={loading}
      sizes={sizes}
      onError={() => {
        if (imageSrc !== fallback) setImageSrc(fallback);
        else setFailed(true);
      }}
    />
  );
}

function ArticleSkeleton() {
  return <main className={styles.articlePage}><div className={styles.loadingState} aria-label="Loading article"><span /><span /><span /><div /></div></main>;
}

function getContentItems(content) {
  if (Array.isArray(content)) return content;
  if (!content || !Array.isArray(content.sections)) return [];

  return [
    content.intro ? { type: "paragraph", text: content.intro } : null,
    ...content.sections.flatMap((section) => [
      section.title ? { type: "heading", text: section.title } : null,
      ...(Array.isArray(section.paragraphs) ? section.paragraphs.map((text) => ({ type: "paragraph", text })) : []),
      section.quote ? { type: "paragraph", text: section.quote } : null,
      section.callout ? { type: "paragraph", text: `PetSphere tip: ${section.callout}` } : null,
      section.heading ? { type: "heading", text: section.heading } : null,
      Array.isArray(section.list) && section.list.length ? { type: "list", items: section.list } : null,
    ]),
  ].filter(Boolean);
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const posts = useSyncExternalStore(subscribeToBlogPosts, getClientPosts, () => blogPosts);
  const post = posts.find((item) => item.slug === slug);
  const [commentSent, setCommentSent] = useState(false);

  if (!slug) return <ArticleSkeleton />;

  if (!post) {
    return <main className={styles.articlePage}><section className={styles.notFound}><p className={styles.category}>404</p><h1>Sorry, we could not find this post.</h1><Link className={styles.backLink} href="/blog">Back to Blog</Link></section></main>;
  }

  const relatedPosts = (post.relatedSlugs || []).map((relatedSlug) => posts.find((item) => item.slug === relatedSlug)).filter(Boolean).slice(0, 3);
  const previousPost = posts.find((item) => item.slug === post.previousSlug);
  const nextPost = posts.find((item) => item.slug === post.nextSlug);
  const fallbackImage = "/petsphere-mark.svg";
  const contentItems = getContentItems(post.content);

  return (
    <main className={styles.articlePage}>
      <article className={styles.article}>
        <Link className={styles.backLink} href="/blog">Back to Blog</Link>

        <header className={styles.articleHeader}>
          <p className={styles.category}>{post.category}</p>
          <h1>{post.title}</h1>
          <p className={styles.byline}>Written by {post.author.name} <span aria-hidden="true">|</span> {post.date} <span aria-hidden="true">|</span> {post.readTime}</p>
        </header>

        <figure className={styles.cover}>
          <div className={styles.coverImage}>
            <SafeImage src={post.image} fallback={fallbackImage} alt={post.imageAlt} fill priority sizes="(max-width: 700px) calc(100vw - 28px), 720px" />
          </div>
          <figcaption>{post.imageCaption}</figcaption>
        </figure>

        <div className={styles.articleBody}>
          <p className={styles.lede}>{post.subtitle}</p>
          {contentItems.map((item, index) => item.type === "heading"
            ? <h2 key={`${item.text}-${index}`}>{item.text}</h2>
            : item.type === "list"
              ? <ul key={`${item.items.join("-")}-${index}`}>{item.items.map((text) => <li key={text}>{text}</li>)}</ul>
              : <p key={`${item.text}-${index}`}>{item.text}</p>)}

          <div className={styles.tags}><strong>Tags</strong><span>{post.tags.join(", ")}</span></div>

        </div>
      </article>

      <nav className={styles.postNav} aria-label="Post navigation">
        {previousPost ? <Link href={`/blog/${previousPost.slug}`}><span>Previous post</span>{previousPost.title}</Link> : <span />}
        {nextPost ? <Link href={`/blog/${nextPost.slug}`}><span>Next post</span>{nextPost.title}</Link> : <span />}
      </nav>

      <section className={styles.related} aria-labelledby="related-title">
        <h2 id="related-title">More posts you may like</h2>
        <div className={styles.relatedGrid}>
          {relatedPosts.map((related) => <Link className={styles.relatedCard} href={`/blog/${related.slug}`} key={related.slug}><div><SafeImage src={related.image} fallback={fallbackImage} alt={related.imageAlt} fill sizes="(max-width: 700px) 100vw, 33vw" loading="lazy" /></div><h3>{related.title}</h3><span>{related.readTime}</span></Link>)}
        </div>
      </section>

      <section className={styles.comments} aria-labelledby="comments-title">
        <h2 id="comments-title">Comments</h2>
        <form className={styles.commentForm} onSubmit={(event) => { event.preventDefault(); setCommentSent(true); }}>
          <label htmlFor="comment-name">Name</label>
          <input id="comment-name" required placeholder="Your name" />
          <label htmlFor="comment-message">Message</label>
          <textarea id="comment-message" required placeholder="Write a comment" />
          <button type="submit">{commentSent ? "Comment posted" : "Post comment"}</button>
          {commentSent && <p className={styles.successMessage} role="status">Your comment was sent.</p>}
        </form>
        <div className={styles.commentList}>
          {[{ name: "Maya R.", text: "This made our first week feel much less hard. The routine checklist helped us a lot.", time: "2 days ago" }, { name: "Jordan Lee", text: "The reminder to keep the first days simple was helpful. I am saving this for later.", time: "5 days ago" }].map((comment) => <article key={comment.name}><div><strong>{comment.name}</strong><small>{comment.time}</small><p>{comment.text}</p></div></article>)}
        </div>
      </section>
    </main>
  );
}
