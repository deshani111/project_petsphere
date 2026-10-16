import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const listings = [
  { slug: "cooper", name: "Cooper", price: "Rs. 1,200", breed: "Golden Retriever", age: "3 months", tags: ["Vaccinated", "Microchipped"], image: "/marketplace-cooper.webp", badge: "Verified" },
  { slug: "luna", name: "Luna", price: "Rs. 850", breed: "Siberian Husky", age: "1.5 years", tags: ["Trained", "Rescue"], image: "/marketplace-luna.webp", badge: "Popular" },
  { slug: "midnight", name: "Midnight", price: "Rs. 500", breed: "Bengal Mix", age: "2 years", tags: ["Indoors Only", "Quiet"], image: "/blog-cat-behavior.webp" },
  { slug: "bella", name: "Bella", price: "Rs. 1,800", breed: "French Bulldog", age: "4 months", tags: ["CKC Registered"], image: "/blog-training.webp" },
  { slug: "oliver", name: "Oliver", price: "Rs. 350", breed: "Parrot", age: "5 years", tags: ["Talkative", "Healthy"], image: "/marketplace-oliver.webp" },
  { slug: "snow", name: "Snow", price: "Rs. 2,100", breed: "Samoyed", age: "6 months", tags: ["Purebred", "Socialized"], image: "/marketplace-snow.webp", badge: "Verified" },
];

export default function MarketplacePage() {
  return (
    <main className={styles.marketplacePage}>
      <section className={styles.marketplaceContent}>
        <div className={styles.toolbar}><div><span className={styles.resultLabel}>The PetSphere marketplace</span><h1>Find a companion with care.</h1><p className={styles.intro}>Browse thoughtful listings from pet owners in your community.</p></div><div className={styles.toolbarActions}><Link href="/owner/marketplace/new" className={styles.postAd}>+ Post an ad</Link><Link href="/owner/marketplace" className={styles.myAds}>My ads</Link></div></div>
        <div className={styles.resultBar}><strong>428 pets</strong><span>reviewed listings available</span></div>
        <form className={styles.filters}>
          <div className={styles.filterTop}><span className={styles.filterTitle}>Refine your search</span><button type="reset">Clear all</button></div>
          <div className={styles.filterFields}>
            <label>Category<select aria-label="Filter by category" defaultValue="Dogs"><option>Dogs</option><option>Cats</option><option>Birds</option></select></label>
            <label>Price range<div className={styles.priceFields}><input placeholder="Min" /><input placeholder="Max" /></div></label>
            <label>Location<input aria-label="Filter by location" placeholder="City or district" /></label>
          </div>
        </form>

        <div className={styles.gridHeading}><span>Showing the newest first</span><button type="button" className={styles.sortButton}>Newest first <span>⌄</span></button></div>
        <section className={styles.listingGrid} aria-label="Pets for sale">
          {listings.map((pet) => (
            <article key={pet.name} className={styles.petCard}>
              <div className={styles.petImage}><Image src={pet.image} alt={pet.name} fill sizes="(max-width: 700px) 100vw, (max-width: 980px) 50vw, 33vw" />{pet.badge && <span className={`${styles.badge} ${pet.badge === "Popular" ? styles.popular : ""}`}>{pet.badge === "Verified" ? "✓ " : ""}{pet.badge}</span>}<button type="button" aria-label={`Save ${pet.name}`}>♡</button></div>
              <div className={styles.petDetails}><div className={styles.nameRow}><div><h3>{pet.name}</h3><p>{pet.breed} <span>·</span> {pet.age}</p></div><strong>{pet.price}</strong></div><div className={styles.tags}>{pet.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><Link href={`/marketplace/${pet.slug}`}>View profile <span aria-hidden="true">↗</span></Link></div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
