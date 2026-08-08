import styles from "./page.module.css";

const listings = [
  { slug: "cooper", name: "Cooper", price: "$1,200", breed: "Golden Retriever", age: "3 months", tags: ["Vaccinated", "Microchipped"], image: "/marketplace-cooper.jpg", badge: "Verified" },
  { slug: "luna", name: "Luna", price: "$850", breed: "Siberian Husky", age: "1.5 years", tags: ["Trained", "Rescue"], image: "/marketplace-luna.jpg", badge: "Popular" },
  { slug: "midnight", name: "Midnight", price: "$500", breed: "Bengal Mix", age: "2 years", tags: ["Indoors Only", "Quiet"], image: "/blog-cat-behavior.jpg" },
  { slug: "bella", name: "Bella", price: "$1,800", breed: "French Bulldog", age: "4 months", tags: ["CKC Registered"], image: "/blog-training.jpg" },
  { slug: "oliver", name: "Oliver", price: "$350", breed: "Parrot", age: "5 years", tags: ["Talkative", "Healthy"], image: "/marketplace-oliver.jpg" },
  { slug: "snow", name: "Snow", price: "$2,100", breed: "Samoyed", age: "6 months", tags: ["Purebred", "Socialized"], image: "/marketplace-snow.jpg", badge: "Verified" },
];

export default function MarketplacePage() {
  return (
    <main className={styles.marketplacePage}>
      <section className={styles.marketplaceContent}>
        <form className={styles.filters}>
          <div className={styles.filterHeading}><div><h1>Browse All Pets</h1><p>Showing 428 results near you</p></div><div className={styles.sort}>Sort by: <strong>Newest First</strong><span>⌄</span><button type="reset">Clear all</button></div></div>
          <div className={styles.filterFields}>
            <label>Category<select defaultValue="Dogs"><option>Dogs</option><option>Cats</option><option>Birds</option></select></label>
            <label>Price Range<div className={styles.priceFields}><input placeholder="Min" /><input placeholder="Max" /></div></label>
            <label>Location<input placeholder="City or zip code" /></label>
            <label>Breed<select defaultValue="All Breeds"><option>All Breeds</option><option>Golden Retriever</option><option>Siberian Husky</option></select></label>
          </div>
        </form>
        <section className={styles.listingGrid} aria-label="Pets for sale">
          {listings.map((pet) => <article key={pet.name} className={styles.petCard}><div className={styles.petImage}><img src={pet.image} alt={pet.name} />{pet.badge && <span className={`${styles.badge} ${pet.badge === "Popular" ? styles.popular : ""}`}>{pet.badge}</span>}<button type="button" aria-label={`Save ${pet.name}`}>♡</button></div><div className={styles.petDetails}><div className={styles.nameRow}><h2>{pet.name}</h2><strong>{pet.price}</strong></div><p><span>♟</span> {pet.breed} · {pet.age}</p><div className={styles.tags}>{pet.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><a href={`/marketplace/${pet.slug}`}>View Profile</a></div></article>)}
        </section>
      </section>
    </main>
  );
}
