import styles from "./page.module.css";

export default function NewPuppyCareArticle() {
  return (
    <main className={styles.articlePage}>
      <article>
        <header className={styles.articleHeader}>
          <a className={styles.backLink} href="/blog">&larr; Back to Pet Care Blog</a>
          <span className={styles.articleLabel}>Pet Health</span>
          <h1>The Essential Guide to New Puppy Care</h1>
          <p className={styles.articleLead}>Welcoming a new furry friend into your home is an exciting journey. Here is how to make the first days calm, safe, and full of connection.</p>
          <div className={styles.author}><span className={styles.avatar}>EC</span><div><strong>Dr. Emily Chen</strong><span>May 12, 2024&nbsp; · &nbsp;8 min read</span></div></div>
        </header>
        <div className={styles.cover}><img src="/blog-featured-puppy.jpg" alt="Golden puppy relaxing in a bright living room" /></div>
        <div className={styles.articleLayout}>
          <aside className={styles.contents}><strong>In this guide</strong><a href="#first-night">The first night</a><a href="#routine">Build a routine</a><a href="#wellness">Early wellness</a><a href="#connection">Grow the bond</a></aside>
          <div className={styles.articleBody}>
            <p>Bringing home a puppy changes the rhythm of the whole household. Everything is new for them: the sounds, smells, people, and routines. A little preparation gives your puppy a secure place to learn while giving you confidence through each new stage.</p>
            <h2 id="first-night">Make the first night feel safe</h2>
            <p>Prepare a quiet sleeping area before your puppy arrives. Keep their bed, water, and one familiar toy close together, and introduce the space during the day so it feels less unfamiliar at bedtime. A consistent, calm response to nighttime noises helps your puppy settle.</p>
            <div className={styles.tip}><strong>PetSphere tip</strong><p>Keep the first few days simple. Short naps, gentle play, and regular bathroom breaks are more useful than an overfilled schedule.</p></div>
            <h2 id="routine">Build a routine from day one</h2>
            <p>Puppies thrive on predictable patterns. Offer meals, bathroom breaks, play, and rest at roughly the same times each day. Reward the behaviors you want to see with a soft voice, a small treat, or a favorite toy.</p>
            <ul><li>Take your puppy outside after waking, eating, and active play.</li><li>Keep training sessions short and end while they are still engaged.</li><li>Protect several quiet nap periods throughout the day.</li></ul>
            <h2 id="wellness">Start their wellness journey early</h2>
            <p>Schedule a first veterinary visit and ask about vaccinations, parasite prevention, nutrition, and safe socialization. Your veterinarian can help create a plan that fits your puppy&apos;s age, breed, and everyday environment.</p>
            <h2 id="connection">Let trust grow at their pace</h2>
            <p>The strongest bond is built through hundreds of small, positive moments. Get down on their level, notice their body language, and give them space when they need a break. Patience now creates a confident companion later.</p>
            <div className={styles.articleEnd}><strong>Ready for your next adventure together?</strong><a href="/#services">Find trusted pet care</a></div>
          </div>
        </div>
      </article>
    </main>
  );
}
