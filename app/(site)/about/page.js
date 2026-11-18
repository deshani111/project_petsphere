import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

const careNotes = [
  {
    label: "Before the handover",
    title: "Your routine comes with them.",
    text: "Share feeding times, walk routes, favourite toys, and the small signals only you notice.",
  },
  {
    label: "During the stay",
    title: "Clear updates, no guessing.",
    text: "Keep the thread open with messages and photo check-ins that show how the day is going.",
  },
  {
    label: "When you return",
    title: "A familiar welcome home.",
    text: "Find care that respects your pet's pace, so the handover feels calm for everyone.",
  },
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <Image
            src="/about-hero-dog.webp"
            alt="A woman sharing a quiet, happy moment with her dog"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 48vw"
          />
          <span className={styles.imageCaption}>The kind of care we look for.</span>
        </div>

        <div className={styles.handover}>
          <div className={styles.handoverTop}>
            <p className={styles.kicker}>About PetSphere</p>
            <span className={styles.noteNumber}>Care note 01</span>
          </div>
          <h1>Good care leaves room for peace of mind.</h1>
          <p className={styles.heroText}>
            PetSphere connects pet parents with sitters who notice the details:
            the familiar walk, the full bowl, the update you were waiting for.
          </p>
          <div className={styles.handoverRule} />
          <dl className={styles.handoverFacts}>
            <div>
              <dt>What matters</dt>
              <dd>Routine, trust, and a clear line home.</dd>
            </div>
            <div>
              <dt>Who it is for</dt>
              <dd>Pets, their people, and the sitters who get it.</dd>
            </div>
          </dl>
          <div className={styles.heroActions}>
            <Link href="/register" className={styles.primaryButton}>Find your sitter</Link>
            <Link href="/#services" className={styles.secondaryLink}>See how it works</Link>
          </div>
        </div>
      </section>

      <section className={styles.trustLedger} aria-label="What PetSphere makes clearer">
        <div><strong>01</strong><span>Vetted people</span></div>
        <div><strong>02</strong><span>Open updates</span></div>
        <div><strong>03</strong><span>Care that follows the routine</span></div>
      </section>

      <section className={styles.purpose}>
        <div className={styles.sectionMarker}>Why PetSphere</div>
        <div className={styles.purposeContent}>
          <h2>Care is a conversation, not a handoff.</h2>
          <div>
            <p>Leaving your pet with someone new is personal. The right sitter does more than follow instructions; they learn the rhythm of a home and keep you close to it.</p>
            <p>We built PetSphere around that exchange, giving owners clarity and giving sitters the context to do their best work.</p>
          </div>
        </div>
      </section>

      <section className={styles.values}>
        <div className={styles.valuesHeading}>
          <div className={styles.sectionMarker}>The care record</div>
          <h2>Three moments that should feel simple.</h2>
        </div>
        <div className={styles.valueList}>
          {careNotes.map((note, index) => (
            <article key={note.label}>
              <span className={styles.valueNumber}>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className={styles.valueLabel}>{note.label}</p>
                <h3>{note.title}</h3>
                <p>{note.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <div className={styles.sectionMarker}>Your next handover</div>
          <h2>Find care that already speaks your language.</h2>
        </div>
        <div className={styles.ctaAction}>
          <p>Tell us what your pet needs. We will help you find someone who listens.</p>
          <Link href="/register" className={styles.primaryButton}>Find a sitter</Link>
        </div>
      </section>
    </main>
  );
}
