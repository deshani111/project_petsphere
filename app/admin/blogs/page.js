"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function Icon({ name }) {
  const common = { width: 14, height: 14, viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  switch (name) {
    case "search":
      return <svg {...common}><circle cx="6" cy="6" r="4" /><path d="m9.2 9.2 3.3 3.3" /></svg>;
    case "plus":
      return <svg {...common}><path d="M7 2.2v9.6M2.2 7h9.6" /></svg>;
    case "edit":
      return <svg {...common}><path d="M2.3 11.7h2.8L11.9 4.9 9.1 2.1 2.3 8.9v2.8Z" /><path d="m8.3 3 2.8 2.8" /></svg>;
    case "delete":
      return <svg {...common}><path d="M2.5 4h9" /><path d="M5.3 4V2.8h3.4V4" /><path d="M4 4.1v7.4h6V4.1" /><path d="M6 6.2v3.2M8 6.2v3.2" /></svg>;
    default:
      return null;
  }
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBlogs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/blogs", {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Blog data could not be loaded.");
      }

      setBlogs(Array.isArray(payload.blogs) ? payload.blogs : []);
    } catch (loadError) {
      setError(loadError.message || "Blog data could not be loaded.");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const filteredArticles = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return blogs;
    return blogs.filter((article) =>
      [
        article.title,
        article.category,
        article.author,
        article.excerpt,
        article.status,
        article.date,
      ].some((value) => String(value || "").toLowerCase().includes(search))
    );
  }, [blogs, query]);

  const handleDelete = async (article) => {
    if (!confirm(`Delete "${article.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blogs/${article.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Blog post could not be deleted.");
      }

      setBlogs((current) => current.filter((item) => item.id !== article.id));
    } catch (deleteError) {
      alert(deleteError.message || "Blog post could not be deleted.");
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Blog Management</h1>
          <p>Create, edit, and moderate community educational content</p>
        </div>
        <div className={styles.controls}>
          <label className={styles.search} aria-label="Search articles">
            <span aria-hidden="true"><Icon name="search" /></span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles..." />
          </label>
          <Link href="/admin/blogs/new" className={styles.newArticle}><Icon name="plus" />New Article</Link>
        </div>
      </header>

      <article className={styles.tableCard}>
        <div className={styles.tableWrap}>
          {loading && <div className={styles.emptyState}><strong>Loading blog posts...</strong></div>}
          {error && !loading && <div className={styles.emptyState}><strong>{error}</strong><span>Try again after checking the admin blog API.</span><button type="button" onClick={loadBlogs}>Retry</button></div>}
          {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id}>
                  <td>
                    <Link href={`/admin/blogs/${article.id}`} className={styles.articleLink}>
                      <div className={styles.articleCell}>
                      <span className={styles.thumbnail}><img src={article.image} alt="" /></span>
                      <div>
                        <strong>{article.title}</strong>
                        <small>{article.excerpt || article.readTimeLabel}</small>
                      </div>
                      </div>
                    </Link>
                  </td>
                  <td><span className={`${styles.category} ${styles[String(article.category || "").toLowerCase().replace(/[^a-z]+/g, "")]}`}>{article.category || "General"}</span></td>
                  <td>
                    <div className={styles.author}>
                      <span className={styles.avatar}>{initials(article.author || "Unknown")}</span>
                      <strong>{article.author || "Unknown Author"}</strong>
                    </div>
                  </td>
                  <td><span className={`${styles.status} ${styles[String(article.status || "").toLowerCase()]}`}><i aria-hidden="true" />{article.status || "published"}</span></td>
                  <td>{article.date || "—"}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/blogs/new?blogId=${article.id}`} aria-label={`Edit ${article.title}`} title="Edit article"><Icon name="edit" /></Link>
                      <button type="button" aria-label={`Delete ${article.title}`} title="Delete article" onClick={() => handleDelete(article)}><Icon name="delete" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          {!loading && !error && !filteredArticles.length && (
            <div className={styles.emptyState}>
              <strong>No articles found</strong>
              <span>Try a different search term.</span>
            </div>
          )}
        </div>

        <footer className={styles.pagination}>
          <span>Showing 1 to {filteredArticles.length} of {blogs.length} articles</span>
          <div>
            <button type="button" disabled aria-label="Previous page">‹</button>
            <button type="button" className={styles.current} aria-current="page">1</button>
            <button type="button" disabled>2</button>
            <button type="button" disabled>3</button>
            <button type="button" disabled aria-label="Next page">›</button>
          </div>
        </footer>
      </article>
    </section>
  );
}
