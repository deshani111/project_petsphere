"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { blogCategories, blogPosts, getClientPosts, subscribeToBlogPosts } from "../../../lib/blog-data";
import styles from "./page.module.css";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);
  const [userRole, setUserRole] = useState(null);
  const posts = useSyncExternalStore(subscribeToBlogPosts, getClientPosts, () => blogPosts);

  useEffect(() => {
    let ignore = false;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((account) => {
        if (!ignore) setUserRole(account?.role || null);
      })
      .catch(() => {
        if (!ignore) setUserRole(null);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const featuredPost = posts.find((post) => post.featured) || posts[0];
  const filteredPosts = useMemo(() => posts.filter((post) => {
    return activeCategory === "All" || post.category === activeCategory;
  }), [activeCategory, posts]);
  const visiblePosts = filteredPosts.slice(0, visibleCount);

  return (
    <main className={styles.blogPage}>
      <section className={styles.hero} aria-labelledby="blog-title">
        <div className={styles.heroGlow} />
        <div className={styles.container}>
          <div className={styles.eyebrow}>The PetSphere journal</div>
          <h1 id="blog-title">Better days<br /><em>start here.</em></h1>
          <p>Helpful ideas, expert advice, and real stories for the people who make every pet feel at home.</p>
          {(userRole === "pet_owner" || userRole === "pet_sitter") && (
            <div className={styles.authorActions} aria-label="Blog author actions">
              <Link className={styles.primaryAction} href="/blog/create" prefetch={false}>Post a blog</Link>
              <Link className={styles.secondaryAction} href="/admin/blogs">View my blogs</Link>
            </div>
          )}
        </div>
      </section>

      <div className={styles.container}>
        <section className={styles.featured} aria-labelledby="featured-title">
          <Link className={styles.featuredImage} href={`/blog/${featuredPost.slug}`}><Image src={featuredPost.image} alt={featuredPost.imageAlt} fill priority sizes="(max-width: 800px) 100vw, 58vw" /></Link>
          <div className={styles.featuredContent}>
            <span className={styles.tag}>Featured story</span><h2 id="featured-title"><Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link></h2><p>{featuredPost.excerpt}</p>
            <div className={styles.authorRow}><span className={styles.avatar}>{featuredPost.author.avatar}</span><span><strong>{featuredPost.author.name}</strong><small>{featuredPost.date} <i /> {featuredPost.readTime}</small></span></div>
            <Link className={styles.readLink} href={`/blog/${featuredPost.slug}`}>Read the story <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className={styles.postsSection} id="articles" aria-labelledby="latest-title">
          <div className={styles.sectionHeading}><div><span className={styles.sectionKicker}>Fresh from the journal</span><h2 id="latest-title">Latest stories</h2></div><span className={styles.resultCount} aria-live="polite">{filteredPosts.length} stories</span></div>
          <fieldset className={styles.chips}><legend className={styles.srOnly}>Filter by category</legend>{blogCategories.map((category) => <button key={category} className={activeCategory === category ? styles.chipActive : ""} type="button" onClick={() => { setActiveCategory(category); setVisibleCount(6); }} aria-pressed={activeCategory === category}>{category}</button>)}</fieldset>
          {visiblePosts.length ? <div className={styles.postGrid}>{visiblePosts.map((post) => <article className={styles.postCard} key={post.slug}><Link href={`/blog/${post.slug}`} className={styles.postImage}><Image src={post.image} alt={post.imageAlt} fill loading="lazy" sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw" /><span>{post.category}</span></Link><div className={styles.postBody}><h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.excerpt}</p><div className={styles.cardMeta}><span className={styles.avatarSmall}>{post.author.avatar}</span><span><strong>{post.author.name}</strong><small>{post.date} <i /> {post.readTime}</small></span></div></div></article>)}</div> : <p className={styles.emptyState} aria-live="polite">No stories match this category.</p>}
          {visibleCount < filteredPosts.length && <button className={styles.loadMore} type="button" onClick={() => setVisibleCount((count) => count + 3)}>Load more stories <span aria-hidden="true">↓</span></button>}
        </section>

        <section className={styles.popularSection} aria-labelledby="popular-title">        <div className={styles.sectionHeading}><div><span className={styles.sectionKicker}>Worth a read</span><h2 id="popular-title">Popular posts</h2></div></div><div className={styles.popularGrid}>{posts.slice(0, 3).map((post, index) => <Link className={styles.popularCard} href={`/blog/${post.slug}`} key={post.slug}><span>0{index + 1}</span><div><strong>{post.title}</strong><small>{post.category} <i /> {post.readTime}</small></div></Link>)}</div></section>
      </div>
    </main>
  );
}
