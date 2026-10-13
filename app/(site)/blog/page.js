import styles from "./page.module.css";

const articles = [
  { title: "5 Tips for Stress-Free Grooming", excerpt: "Help your pet learn to love bath time with these expert-approved desensitization techniques.", date: "May 10, 2024", author: "Mark Hudson", image: "/blog-featured-puppy.jpg" },
  { title: "Understanding Cat Body Language", excerpt: "Slow blinks to tail flicks: what your feline companion is actually trying to tell you.", date: "May 08, 2024", author: "Sarah J. Miller", image: "/blog-cat-behavior.jpg" },
  { title: "Seasonal Allergies in Dogs", excerpt: "How to identify and treat common environmental triggers during the spring season.", date: "May 05, 2024", author: "Dr. Emily Chen", image: "/blog-dog-health.jpg" },
  { title: "The Power of Positive Reinforcement", excerpt: "Why rewards-based training is the most effective way to build a bond with your pet.", date: "May 01, 2024", author: "James Wilson", image: "/blog-training.jpg" },
];

export default function BlogPage() {
  return (
    <main className={styles.blogPage}>
      <section className={styles.blogIntro}><h1>Pet Care Blog</h1><p>Expert advice, tips, and stories for every pet parent, curated by veterinary professionals and seasoned pet lovers.</p></section>
      <section className={styles.featured}>
        <a className={styles.featuredImage} href="/blog/new-puppy-care"><img src="/blog-featured-puppy.jpg" alt="A golden puppy relaxing in a warm home" /><div className={styles.featuredOverlay}><span className={styles.featuredTag}>★ Featured</span><h2>The Essential Guide to New Puppy Care</h2><p>Welcoming a new furry friend into your home is an exciting journey. Our comprehensive guide covers everything from the first night to lifelong health habits.</p><div className={styles.featuredAuthor}><span className={styles.avatar}>EC</span><div><strong>Dr. Emily Chen</strong><small>May 12, 2024 · 8 min read</small></div></div></div></a>
      </section>
      <section className={styles.articleSection} id="articles">
        <div className={styles.articleGrid}>{articles.map((article) => <article className={styles.articleCard} key={article.title}><div className={styles.articleImage}><img src={article.image} alt="" /></div><div className={styles.articleBody}><h3>{article.title}</h3><p>{article.excerpt}</p><div className={styles.cardMeta}><span className={styles.avatarSmall}>{article.author.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><strong>{article.author}</strong><small>{article.date}</small></span></div></div></article>)}</div>
        <div className={styles.pagination}><button type="button">‹</button><button className={styles.current} type="button">1</button><button type="button">2</button><button type="button">3</button><button type="button">›</button></div>
      </section>
    </main>
  );
}
