"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

const defaultContent = `Summer heat can be challenging for our furry friends. As the temperatures rise, it's crucial to understand how to keep them cool and safe. Start by ensuring they have constant access to fresh, cool water and plenty of shade.

Avoid walking them during the hottest parts of the day, usually between 10 AM and 4 PM, when the pavement can burn their sensitive paw pads.`;

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
    case "image":
      return <svg {...common}><rect x="1.7" y="2.2" width="10.6" height="9.6" rx="1.6" /><path d="M3.2 9.5 5.9 7l2 1.9 1.2-1.2 1.7 1.8" /><circle cx="5" cy="5" r="1" /></svg>;
    case "bold":
      return <svg {...common}><path d="M4 2.8h3.1a2.1 2.1 0 0 1 0 4.2H4V2.8Z" /><path d="M4 7h3.7a2.2 2.2 0 0 1 0 4.4H4V7Z" /></svg>;
    case "italic":
      return <svg {...common}><path d="M5.2 2.8h3.4M4.2 11.2h3.4M7.9 2.8 5.9 11.2" /></svg>;
    case "underline":
      return <svg {...common}><path d="M4 2.8v3.6a3 3 0 0 0 6 0V2.8" /><path d="M3 11.2h8" /></svg>;
    case "h1":
      return <svg {...common}><path d="M2.4 2.8v8.4M2.4 7h5.2M9.1 5h2.5v6.2M9.1 11.2h3" /></svg>;
    case "h2":
      return <svg {...common}><path d="M2.4 2.8v8.4M2.4 7h5.2M9.1 6.5c0-1.1.8-2 1.9-2s1.9.8 1.9 2c0 1.6-3.8 2.6-3.8 4.6h3.9" /></svg>;
    case "link":
      return <svg {...common}><path d="M5.4 8.6 4.3 9.7a2.4 2.4 0 0 1-3.4-3.4l1.2-1.2" /><path d="M8.6 5.4 9.7 4.3A2.4 2.4 0 0 1 13.1 7.7l-1.2 1.2" /><path d="M5.2 9 8.8 5" /></svg>;
    default:
      return null;
  }
}

function useEditorActions() {
  const textareaRef = useRef(null);

  const applyWrap = (prefix, suffix = prefix) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return null;
    }

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || "selected text";
    const replacement = `${prefix}${selected}${suffix}`;
    const nextValue = `${value.slice(0, selectionStart)}${replacement}${value.slice(selectionEnd)}`;

    textarea.value = nextValue;
    textarea.focus();
    textarea.setSelectionRange(selectionStart + prefix.length, selectionStart + replacement.length - suffix.length);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    return nextValue;
  };

  const applyPrefix = (prefix) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return null;
    }

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || "Heading";
    const replacement = `${prefix}${selected}`;
    const nextValue = `${value.slice(0, selectionStart)}${replacement}${value.slice(selectionEnd)}`;

    textarea.value = nextValue;
    textarea.focus();
    textarea.setSelectionRange(selectionStart + prefix.length, selectionStart + replacement.length);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    return nextValue;
  };

  return { textareaRef, applyWrap, applyPrefix };
}

export default function AdminNewArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams.get("blogId");
  const { textareaRef, applyWrap, applyPrefix } = useEditorActions();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingArticle, setLoadingArticle] = useState(Boolean(blogId));
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Pet Health");
  const [primaryTag, setPrimaryTag] = useState("");
  const [content, setContent] = useState(defaultContent);
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageName, setFeaturedImageName] = useState("");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    if (!blogId) {
      setLoadingArticle(false);
      return;
    }

    let ignore = false;

    (async () => {
      setLoadingArticle(true);
      try {
        const response = await fetch(`/api/admin/blogs/${blogId}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "Blog post could not be loaded.");
        }

        if (ignore) {
          return;
        }

        const blog = payload.blog || {};
        setTitle(blog.title || "");
        setCategory(blog.category || "Pet Health");
        setPrimaryTag(blog.primaryTag || "");
        setContent(blog.content || defaultContent);
        setFeaturedImage(blog.image || "");
        setFeaturedImageName(blog.image ? "Existing featured image" : "");
        setStatus(blog.status || "draft");
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message || "Blog post could not be loaded.");
        }
      } finally {
        if (!ignore) {
          setLoadingArticle(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [blogId]);

  const submitArticle = async (status) => {
    if (!title.trim()) {
      setError("Article title is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(blogId ? `/api/admin/blogs/${blogId}` : "/api/admin/blogs", {
        method: blogId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          primaryTag: primaryTag.trim(),
          status,
          image: featuredImage,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Article could not be saved.");
      }

      setMessage(status === "draft" ? "Draft saved successfully." : "Article published successfully.");
      setTimeout(() => {
        router.push("/admin/blogs");
      }, 500);
    } catch (saveError) {
      setError(saveError.message || "Article could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image under 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFeaturedImage(String(reader.result || ""));
      setFeaturedImageName(file.name);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link href="/admin/blogs">Admin</Link>
        <span>/</span>
        <Link href="/admin/blogs">Blogs</Link>
        <span>/</span>
        <strong>New Article</strong>
      </div>

      <header className={styles.header}>
        <Link href="/admin/blogs" className={styles.backButton} aria-label="Back to Blog Management">
          <Icon name="back" />
        </Link>
        <h1>{blogId ? "Edit Article" : "Create New Article"}</h1>
      </header>

      {message && <div className={styles.notice} role="status">{message}</div>}
      {error && <div className={styles.error} role="alert">{error}</div>}
      {loadingArticle && <div className={styles.notice} role="status">Loading article…</div>}

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          submitArticle(status);
        }}
      >
        <section className={styles.card}>
          <label className={styles.field}>
            <span>Article Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter a compelling title..."
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option>Pet Health</option>
                <option>Training</option>
                <option>Nutrition</option>
                <option>Behavior</option>
                <option>Grooming</option>
                <option>Owner Guides</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Primary Tag</span>
              <input
                value={primaryTag}
                onChange={(event) => setPrimaryTag(event.target.value)}
                placeholder="e.g., Wellness"
              />
            </label>
          </div>
        </section>

        <section className={styles.uploadCard}>
          <div className={styles.uploadHeader}>Featured Image</div>
          <div className={styles.uploadArea}>
            {featuredImage ? (
              <img src={featuredImage} alt={featuredImageName || "Featured preview"} />
            ) : (
              <div className={styles.uploadEmpty}>
                <span className={styles.uploadIcon}><Icon name="image" /></span>
                <p>Recommended size: 1200 × 675px</p>
                <small>PNG, JPG, or WEBP up to 5MB</small>
                <button type="button" className={styles.uploadButton} onClick={() => fileInputRef.current?.click()}>
                  Upload Featured Image
                </button>
              </div>
            )}
            <input ref={fileInputRef} className={styles.fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
          </div>
          {featuredImage && (
            <div className={styles.uploadActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => fileInputRef.current?.click()}>
                Replace Image
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => { setFeaturedImage(""); setFeaturedImageName(""); }}>
                Remove Image
              </button>
            </div>
          )}
        </section>

        <section className={styles.editorCard}>
          <div className={styles.toolbar}>
            <button type="button" onClick={() => applyWrap("**")}><Icon name="bold" /></button>
            <button type="button" onClick={() => applyWrap("_")}><Icon name="italic" /></button>
            <button type="button" onClick={() => applyWrap("<u>", "</u>")}><Icon name="underline" /></button>
            <button type="button" onClick={() => applyPrefix("# ")}><Icon name="h1" /></button>
            <button type="button" onClick={() => applyPrefix("## ")}><Icon name="h2" /></button>
            <button type="button" onClick={() => applyWrap("[", "](https://)") }><Icon name="link" /></button>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            aria-label="Article content"
          />
        </section>

        <footer className={styles.actions}>
          <button
            type="button"
            className={styles.saveDraft}
            disabled={isSubmitting || loadingArticle}
            onClick={() => { setStatus("draft"); submitArticle("draft"); }}
          >
            Save Draft
          </button>
          <button
            type="button"
            className={styles.publish}
            disabled={isSubmitting || loadingArticle}
            onClick={() => { setStatus("published"); submitArticle("published"); }}
          >
            Publish Article
          </button>
        </footer>
      </form>
    </section>
  );
}
