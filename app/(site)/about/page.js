import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

const values = [
  { number: "01", title: "Care with intention", text: "Good care respects the routines, quirks, and comforts that make every pet unique." },
  { number: "02", title: "Trust through clarity", text: "Thoughtful details and open communication help pet parents feel at ease." },
  { number: "03", title: "Better together", text: "We connect pet parents with people who bring patience, warmth, and experience." },
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> A little about us</p>
          <h1>Because they&apos;re <em>family.</em></h1>
          <p className={styles.heroText}>
            PetSphere brings pet parents and caring sitters together, so finding
            the right care feels a little more like finding a friend.
          </p>
          <div className={styles.heroActions}>
            <Link href="/register" className={styles.primaryButton}>Find your sitter <span aria-hidden="true">&rarr;</span></Link>
            <Link href="/#services" className={styles.secondaryLink}>Explore PetSphere</Link>
          </div>
          <div className={styles.heroFootnote}><span className={styles.footnoteMark}>P</span><p>Made for the love<br />we share with pets.</p></div>
        </div>

        <div className={styles.photoComposition}>
          <div className={styles.mainPhoto}>
            <Image src="/about-hero-dog.webp" alt="A woman sharing a quiet, happy moment with her dog" fill priority sizes="(max-width: 820px) 100vw, 48vw" />
          </div>
          <div className={styles.smallPhoto}>
            <Image src="/about-cat-care.webp" alt="A cat being cared for at home" fill sizes="(max-width: 820px) 38vw, 18vw" />
          </div>
          <div className={styles.photoLabel}><span>Care that feels familiar</span><b>For every kind of pet.</b></div>
          <span className={styles.photoSpark} aria-hidden="true">*</span>
        </div>
      </section>

      <section className={styles.purpose}>
        <div className={styles.purposeLabel}><span className={styles.eyebrow}><span /> Why PetSphere</span><span className={styles.purposeIndex}>01 / 02</span></div>
        <div className={styles.purposeContent}>
          <h2>Finding care should feel <em>good.</em></h2>
          <div><p>Leaving your pet with someone new is personal. We understand that the little details matter: the familiar walk, the favourite toy, the update that lets you relax.</p><p>PetSphere is here to make those connections easier, and to help every pet feel safe, seen, and right at home.</p></div>
        </div>
      </section>

      <section className={styles.values}>
        <div className={styles.valuesHeading}><p className={styles.eyebrow}><span /> What matters to us</p><h2>Good care has a few things in common.</h2></div>
        <div className={styles.valueList}>{values.map((value) => <article key={value.number}><span className={styles.valueNumber}>{value.number}</span><div><h3>{value.title}</h3><p>{value.text}</p></div></article>)}</div>
      </section>

      <section className={styles.cta}>
        <div><p className={styles.eyebrow}><span /> Come on in</p><h2>There&apos;s room in our circle for you.</h2></div>
        <div className={styles.ctaAction}><p>Find someone who gets your pet, or share your own love of animals with a family nearby.</p><Link href="/register" className={styles.primaryButton}>Join PetSphere <span aria-hidden="true">&rarr;</span></Link></div>
      </section>
    </main>
  );
}
