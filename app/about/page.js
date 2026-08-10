import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <main className={styles.aboutPage}>
      <section className={styles.aboutHero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Our Mission</span>
          <h1>Dedicated to Every Tail, Friend, and Paw.</h1>
          <p>PetSphere is more than a platform; it&apos;s a promise to redefine pet care through community, trust, and expertise. We believe every pet deserves the highest standard of love and professional attention.</p>
          <div className={styles.heroActions}><a href="/#services">Explore Services</a><a href="#story">Learn More</a></div>
        </div>
        <div className={styles.heroPhoto}><img src="/blog-featured-puppy.jpg" alt="A happy puppy relaxing in a warm home" /></div>
      </section>

      <section className={styles.storySection} id="story">
        <div className={styles.storyPhoto}><img src="/blog-training.jpg" alt="A pet owner training a dog outdoors" /></div>
        <div className={styles.storyCopy}>
          <h2>How It All Started</h2>
          <p>Born from a simple need for trusted care during a sudden travel moment, PetSphere began as a local community network. We realized that pet parents weren&apos;t just looking for a service; they were looking for a family they could trust with their most precious companions.</p>
          <p>Today, we&apos;re proud to bring that same personal connection to pet owners and sitters everywhere. We&apos;re building a community with verified professionals, two-way referrals, and a vibrant community that shares the same passion for animal welfare.</p>
          <blockquote>“We don&apos;t just care for pets; we nurture the bond that makes life meaningful.”<cite>— Elena Rodriguez, Founder</cite></blockquote>
        </div>
      </section>

      <section className={styles.valuesSection}>
        <div className={styles.sectionIntro}><h2>Our Core Values</h2><p>The principles that guide every interaction on PetSphere.</p></div>
        <div className={styles.valueGrid}>
          <article><span className={styles.valueIcon}>♡</span><h3>Safety First</h3><p>Every sitter and service provider undergoes a comprehensive verification process, ensuring a trusted experience for every family.</p></article>
          <article><span className={`${styles.valueIcon} ${styles.green}`}>♟</span><h3>Community Built</h3><p>We are driven by our users. Our best ideas are shaped by the pet owners and sitters we serve together.</p></article>
          <article><span className={`${styles.valueIcon} ${styles.orange}`}>♧</span><h3>Expert Care</h3><p>Access to 54,700+ sitters and trusted specialists, with the right hands-on support for every pet.</p></article>
        </div>
      </section>
      <section className={styles.ctaSection}><h2>Ready to join the PetSphere family?</h2><p>Whether you&apos;re looking for world-class care or want to offer your services to local pet parents, there&apos;s a place for you in our community.</p><div><a href="/#services">Find a Sitter</a><a href="/#services">Become a Sitter</a></div></section>
    </main>
  );
}
