import Link from "next/link";
import { getCurrentSession } from "../../../lib/session";
import MarketplaceListings from "./marketplace-listings";
import styles from "./page.module.css";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default async function MarketplacePage() {
  const session = await getCurrentSession();
  const canPost = session?.role === "pet_owner" || session?.role === "pet_sitter";

  return (
    <main className={styles.marketplacePage}>
      <section className={styles.marketplaceContent}>
        <div className={styles.toolbar}><div><span className={styles.resultLabel}>Marketplace</span><h1>Find your next companion.</h1><p className={styles.intro}>Browse trusted listings from pet owners in your community.</p></div><div className={styles.toolbarActions}>{canPost ? <><Link href="/marketplace/new" className={styles.postAd}>+ Post an ad</Link><Link href="/marketplace/my-ads" className={styles.myAds}>My ads</Link></> : !session ? <Link href="/login" className={styles.postAd}>Sign in to post</Link> : null}</div></div>
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
        <MarketplaceListings />
      </section>
    </main>
  );
}