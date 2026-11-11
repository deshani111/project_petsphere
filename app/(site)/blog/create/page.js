"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { blogCategories, getClientPosts, savePost } from "../../../../lib/blog-data";
import styles from "./page.module.css";

const DRAFT_KEY = "petsphere-blog-draft";
const emptyBlocks = [{ type: "paragraph", text: "" }];

function makeSlug(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function wordCount(blocks) {
  return blocks.reduce((total, block) => total + (block.type === "list" ? block.items.join(" ") : block.text).trim().split(/\s+/).filter(Boolean).length, 0);
}

function makePost(data, status) {
  const words = wordCount(data.blocks);
  return {
    id: data.id || `local-${Date.now()}`,
    slug: data.slug,
    title: data.title.trim(),
    subtitle: data.subtitle.trim(),
    excerpt: data.subtitle.trim(),
    content: data.blocks,
    category: data.category,
    tags: data.tags,
    image: data.image,
    imageAlt: data.imageAlt.trim(),
    imageCaption: data.imageCaption.trim(),
    author: { name: data.authorName.trim(), avatar: data.authorName.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "PS" },
    date: formatDate(data.publishDate),
    readTime: `${Math.max(1, Math.ceil(words / 200))} min read`,
    featured: false,
    relatedSlugs: [],
    status,
  };
}

function getInitialData(editSlug) {
  const defaultData = {
    id: "",
    title: "",
    subtitle: "",
    image: "",
    imageAlt: "",
    imageCaption: "",
    blocks: emptyBlocks,
    category: "",
    tags: [],
    authorName: "",
    publishDate: today(),
    slug: "",
  };
  if (typeof window === "undefined") return defaultData;
  const existing = editSlug ? getClientPosts().find((post) => post.slug === editSlug) : null;
  const savedDraft = !editSlug ? window.localStorage.getItem(DRAFT_KEY) : null;
  let draft = null;
  if (savedDraft) {
    try {
      draft = JSON.parse(savedDraft);
    } catch (error) {
      console.error("Could not read the blog draft.", error);
    }
  }
  const source = existing || draft;
  if (!source) return defaultData;
  return {
    id: source.id || "",
    title: source.title || "",
    subtitle: source.subtitle || "",
    image: source.image || "",
    imageAlt: source.imageAlt || "",
    imageCaption: source.imageCaption || "",
    blocks: Array.isArray(source.content) && source.content.length ? source.content : emptyBlocks,
    category: source.category || "",
    tags: source.tags || [],
    authorName: source.author?.name || "",
    publishDate: source.date ? new Date(source.date).toISOString().slice(0, 10) : today(),
    slug: source.slug || "",
  };
}

export default function CreateBlogPage() {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const [data, setData] = useState(() => getInitialData(editSlug));
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [publishedPost, setPublishedPost] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [imageName, setImageName] = useState("");
  const fieldRefs = useRef({});

  const posts = getClientPosts();
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((account) => {
        const name = account?.name || account?.user?.name || account?.email || "";
        if (name) setData((current) => ({ ...current, authorName: current.authorName || name }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      setDirty(false);
      setStatusMessage("Saved just now");
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    const leave = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty]);

  function update(patch) {
    setData((current) => ({ ...current, ...patch }));
    setDirty(true);
    setStatusMessage("");
  }

  function updateBlock(index, patch) {
    const blocks = data.blocks.map((block, blockIndex) => blockIndex === index ? { ...block, ...patch } : block);
    update({ blocks });
  }

  function addBlock(type) {
    update({ blocks: [...data.blocks, type === "list" ? { type, items: [""] } : { type, text: "" }] });
  }

  function removeBlock(index) {
    if (data.blocks.length === 1) return;
    update({ blocks: data.blocks.filter((_, blockIndex) => blockIndex !== index) });
  }

  function moveBlock(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= data.blocks.length) return;
    const blocks = [...data.blocks];
    [blocks[index], blocks[nextIndex]] = [blocks[nextIndex], blocks[index]];
    update({ blocks });
  }

  function addTag(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const tag = tagInput.trim();
    if (tag && !data.tags.includes(tag)) update({ tags: [...data.tags, tag] });
    setTagInput("");
  }

  function chooseImage(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update({ image: reader.result });
      setImageName(file.name);
    };
    reader.onerror = () => setSaveError("Could not read this image.");
    reader.readAsDataURL(file);
  }

  function validate() {
    const nextErrors = {};
    if (!data.title.trim()) nextErrors.title = "Title is required.";
    if (!data.blocks.some((block) => block.type === "paragraph" && block.text.trim())) nextErrors.content = "Add at least one paragraph.";
    if (!data.category) nextErrors.category = "Choose a category.";
    if (!data.image) nextErrors.image = "Add a cover image.";
    if (!data.imageAlt.trim()) nextErrors.imageAlt = "Add an image description.";
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) fieldRefs.current[first]?.focus();
    return !first;
  }

  function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const baseSlug = data.slug || makeSlug(data.title) || `draft-${Date.now()}`;
      const slugTaken = posts.some((post) => post.slug === baseSlug && post.slug !== editSlug);
      const slug = slugTaken ? `${baseSlug}-${Date.now()}` : baseSlug;
      const post = makePost({ ...data, slug }, "published");
      savePost(post);
      window.localStorage.removeItem(DRAFT_KEY);
      setDirty(false);
      setStatusMessage("Post published.");
      setPublishedPost(post);
    } catch (error) {
      console.error("Could not save blog post.", error);
      setSaveError("Could not save this post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.createPage}>
      <div className={styles.pageIntro}>
        <Link className={styles.backLink} href="/blog">Back to blog</Link>
        <div>
          <p className={styles.eyebrow}>PetSphere journal</p>
          <h1>Write a new post</h1>
          <p className={styles.introText}>Share a calm, useful idea with pet families.</p>
        </div>
      </div>

      {Object.keys(errors).length > 0 && <div className={styles.formError} role="alert" aria-live="polite">Please fix the first error below.</div>}
      {saveError && <div className={styles.formError} role="alert" aria-live="polite">{saveError}</div>}
      <div className={styles.editorLayout}>
        <section className={styles.writingArea} aria-labelledby="writing-title">
          <h2 id="writing-title" className={styles.srOnly}>Write your post</h2>
          <label className={styles.fieldLabel} htmlFor="title">Title</label>
          <input ref={(element) => { fieldRefs.current.title = element; }} id="title" className={styles.titleInput} value={data.title} onChange={(event) => update({ title: event.target.value, slug: makeSlug(event.target.value) })} placeholder="Add a title" />
          {errors.title && <p className={styles.fieldError} aria-live="polite">{errors.title}</p>}

          <div className={styles.coverHeader}><span className={styles.fieldLabel}>Cover image</span>{imageName && <span className={styles.fileName}>{imageName}</span>}</div>
          <div
            className={`${styles.dropZone} ${errors.image ? styles.hasError : ""}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => { event.preventDefault(); chooseImage(event.dataTransfer.files[0]); }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fieldRefs.current.image?.click();
              }
            }}
            role="button"
            tabIndex="0"
            aria-label="Choose a cover image"
          >
            {data.image ? <img src={data.image} alt={data.imageAlt || "Cover preview"} /> : <p>Drop an image here</p>}
            <label className={styles.chooseButton} htmlFor="cover-image">Choose image</label>
            <input ref={(element) => { fieldRefs.current.image = element; }} id="cover-image" type="file" accept="image/*" onChange={(event) => chooseImage(event.target.files[0])} />
            {data.image && <button className={styles.removeButton} type="button" onClick={() => update({ image: "" })}>Remove image</button>}
          </div>
          {errors.image && <p className={styles.fieldError} aria-live="polite">{errors.image}</p>}
          <div className={styles.twoFields}>
            <div><label className={styles.fieldLabel} htmlFor="image-alt">Image description</label><input ref={(element) => { fieldRefs.current.imageAlt = element; }} id="image-alt" value={data.imageAlt} onChange={(event) => update({ imageAlt: event.target.value })} placeholder="Describe the image" />{errors.imageAlt && <p className={styles.fieldError} aria-live="polite">{errors.imageAlt}</p>}</div>
            <div><label className={styles.fieldLabel} htmlFor="image-caption">Caption <span>(optional)</span></label><input id="image-caption" value={data.imageCaption} onChange={(event) => update({ imageCaption: event.target.value })} placeholder="Add a caption" /></div>
          </div>

          <div className={styles.contentHeader}><h2>Content</h2><span>{wordCount(data.blocks)} words</span></div>
          <div className={styles.blocks}>
            {data.blocks.map((block, index) => <div className={styles.block} key={`${block.type}-${index}`}>
              <div className={styles.blockTop}><span>{block.type === "heading" ? "Heading" : block.type === "list" ? "Bulleted list" : "Paragraph"}</span><div><button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label={`Move block ${index + 1} up`}>↑</button><button type="button" onClick={() => moveBlock(index, 1)} disabled={index === data.blocks.length - 1} aria-label={`Move block ${index + 1} down`}>↓</button><button type="button" onClick={() => removeBlock(index)} disabled={data.blocks.length === 1} aria-label={`Delete block ${index + 1}`}>×</button></div></div>
              {block.type === "list" ? <textarea value={block.items.join("\n")} onChange={(event) => updateBlock(index, { items: event.target.value.split("\n") })} placeholder="One item per line" rows="3" /> : block.type === "heading" ? <input value={block.text} onChange={(event) => updateBlock(index, { text: event.target.value })} placeholder="Add a heading" /> : <textarea value={block.text} onChange={(event) => updateBlock(index, { text: event.target.value })} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); const blocks = [...data.blocks]; blocks.splice(index + 1, 0, { type: "paragraph", text: "" }); update({ blocks }); } }} placeholder="Write a paragraph" rows="4" />}
            </div>)}
          </div>
          {errors.content && <p className={styles.fieldError} aria-live="polite">{errors.content}</p>}
          <div className={styles.addButtons}><button type="button" onClick={() => addBlock("heading")}>Add heading</button><button type="button" onClick={() => addBlock("paragraph")}>Add paragraph</button><button type="button" onClick={() => addBlock("list")}>Add list</button></div>
        </section>

        <aside className={styles.settings} aria-label="Post settings">
          <div className={styles.settingsCard}>
            <h2>Post settings</h2>
            <label className={styles.fieldLabel} htmlFor="category">Category</label>
            <select ref={(element) => { fieldRefs.current.category = element; }} id="category" value={data.category} onChange={(event) => update({ category: event.target.value })}><option value="">Choose a category</option>{blogCategories.filter((category) => category !== "All").map((category) => <option key={category}>{category}</option>)}</select>
            {errors.category && <p className={styles.fieldError} aria-live="polite">{errors.category}</p>}
            <label className={styles.fieldLabel} htmlFor="tags">Tags</label>
            <input id="tags" value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={addTag} placeholder="Type a tag and press Enter" />
            <div className={styles.tags}>{data.tags.map((tag) => <span key={tag}>{tag}<button type="button" onClick={() => update({ tags: data.tags.filter((item) => item !== tag) })} aria-label={`Remove ${tag}`}>×</button></span>)}</div>
            <label className={styles.fieldLabel} htmlFor="author">Author name</label>
            <input id="author" value={data.authorName} onChange={(event) => update({ authorName: event.target.value })} placeholder="Your name" />
            <label className={styles.fieldLabel} htmlFor="publish-date">Publish date</label>
            <input id="publish-date" type="date" value={data.publishDate} onChange={(event) => update({ publishDate: event.target.value })} />
          </div>
          <div className={styles.publishCard}>
            <p className={styles.savedText} role="status" aria-live="polite">{statusMessage}</p>
            {publishedPost && <p className={styles.successMessage} role="status" aria-live="polite">Your post is live. <Link href={`/blog/${publishedPost.slug}`}>View post</Link></p>}
            <button className={styles.publishButton} type="button" onClick={handleSave} disabled={isSaving}>{isSaving ? "Publishing..." : "Publish"}</button>
          </div>
        </aside>
      </div>
    </main>
  );
}
