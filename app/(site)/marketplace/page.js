import Link from "next/link";
import { getCurrentSession } from "../../../lib/session";
import { getPublicListingCount } from "../../../modules/marketplace/marketplace.service";
import MarketplaceListings from "./marketplace-listings";
import styles from "./page.module.css";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default async function MarketplacePage() {
  const [session, listingCount] = await Promise.all([getCurrentSession(), getPublicListingCount()]);
  const canPost = session?.role === "pet_owner" || session?.role === "pet_sitter";
  const listingLabel = listingCount === 1 ? "pet" : "pets";

  return (
    <main className={styles.marketplacePage}>
      <section className={styles.marketplaceContent}>
        <div className={styles.toolbar}><div><span className={styles.resultLabel}>Marketplace</span><h1>Find your next companion.</h1><p className={styles.intro}>Browse trusted listings from pet owners in your community.</p></div><div className={styles.toolbarActions}>{canPost ? <><Link href="/marketplace/new" className={styles.postAd}>+ Post an ad</Link><Link href="/marketplace/my-ads" className={styles.myAds}>My ads</Link></> : !session ? <Link href="/login" className={styles.postAd}>Sign in to post</Link> : null}</div></div>
        <div className={styles.resultBar} aria-live="polite"><strong>{listingCount.toLocaleString("en-LK")} {listingLabel}</strong><span>reviewed listings available</span></div>
        <MarketplaceListings />
      </section>
    </main>
  );
}
