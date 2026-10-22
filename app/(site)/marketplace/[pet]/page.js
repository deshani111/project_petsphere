import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { prisma } from "../../../../lib/prisma";
import styles from "./page.module.css";

const LOCATION_MARKER = "\n\nLocation: ";
const PET_DETAILS_MARKER = "\n\nPet details:\n";

function splitDescription(value) {
  const description = value || "";
  const locationIndex = description.lastIndexOf(LOCATION_MARKER);
  const listingText = locationIndex === -1 ? description : description.slice(0, locationIndex);
  const detailsIndex = listingText.lastIndexOf(PET_DETAILS_MARKER);
  const petDetails = {};
  if (detailsIndex !== -1) listingText.slice(detailsIndex + PET_DETAILS_MARKER.length).split("\n").forEach((line) => {
    const [label, ...detailValue] = line.split(": ");
    if (label && detailValue.length) petDetails[label.toLowerCase()] = detailValue.join(": ");
  });
  return { description: detailsIndex === -1 ? listingText : listingText.slice(0, detailsIndex), location: locationIndex === -1 ? null : description.slice(locationIndex + LOCATION_MARKER.length) || null, petDetails };
}

function formatPrice(price) {
  if (!price) return "Price on request";
  return `Rs. ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(Number(price))}`;
}

function getPoster(listing) {
  const user = listing.pet_owner?.users || listing.pet_sitter?.users;
  if (!user) return { name: "PetSphere member", phone: null, email: null };
  return { name: user.full_name || `${user.first_name} ${user.last_name}`.trim(), phone: user.phone_number, email: user.email };
}

export default async function MarketplaceProfilePage({ params }) {
  const { pet } = await params;
  if (!/^\d+$/.test(pet)) notFound();

  const listing = await prisma.advertisement.findUnique({
      where: { ad_id: BigInt(pet) },
      select: {
        ad_id: true, title: true, description: true, price: true, photo_url: true, pet_type: true, pet_name: true, breed: true, age: true, gender: true, status: true, created_date: true,
        vaccinated: true, microchipped: true, house_trained: true, good_with_children: true, good_with_other_pets: true, special_care_needed: true,
        photos: { orderBy: { sort_order: "asc" }, select: { photo_url: true } },
        pet_owner: { select: { users: { select: { first_name: true, last_name: true, full_name: true, phone_number: true, email: true } } } },
        pet_sitter: { select: { users: { select: { first_name: true, last_name: true, full_name: true, phone_number: true, email: true } } } },
      },
    });

  if (!listing || listing.status !== "approved") notFound();
  const details = splitDescription(listing.description);
  const petDetails = { type: listing.pet_type, name: listing.pet_name, breed: listing.breed, age: listing.age, gender: listing.gender };
  const careDetails = [
    ["Vaccinated", listing.vaccinated],
    ["Microchipped", listing.microchipped],
    ["House trained", listing.house_trained],
    ["Good with children", listing.good_with_children],
    ["Good with other pets", listing.good_with_other_pets],
    ["Special care needed", listing.special_care_needed],
  ].filter(([, value]) => value);
  const poster = getPoster(listing);
  const listedOn = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(listing.created_date);

  const content = (
    <main className={styles.profilePage}>
      <section className={styles.profileContent}>
        <Link href="/marketplace" className={styles.back}><span aria-hidden="true">←</span> Marketplace</Link>
        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            <div className={styles.imageWrap}>
              <Image src={listing.photo_url || "/marketplace-cooper.webp"} alt={listing.title} fill priority sizes="(max-width: 850px) 100vw, 66vw" />
              <div className={styles.imageOverlay}><span>Available now</span><p>{listing.title}</p></div>
            </div>
            {listing.photos.length > 1 && <div className={styles.photoStrip}>{listing.photos.map((photo, index) => <Image key={photo.photo_url} src={photo.photo_url} alt={`${listing.title} photo ${index + 1}`} width={110} height={80} />)}</div>}
            <section className={styles.about}>
              <span className={styles.eyebrow}>About this listing</span>
              <h1>{listing.title}</h1>
              <div className={styles.meta}><span><MapPin size={16} aria-hidden="true" />{details.location || "Location available on request"}</span><span><CalendarDays size={15} aria-hidden="true" />Listed {listedOn}</span></div>
              <section className={styles.petFacts} aria-labelledby="pet-details-heading"><h2 id="pet-details-heading">Pet details</h2><div>{[["Pet type", petDetails.type], ["Pet name", petDetails.name], ["Breed", petDetails.breed], ["Age", petDetails.age], ["Gender", petDetails.gender]].map(([label, detailValue]) => <span key={label}><small>{label}</small><b>{detailValue || "Not specified"}</b></span>)}</div></section>
              {careDetails.length > 0 && <section className={styles.petFacts} aria-labelledby="care-heading"><h2 id="care-heading">Care &amp; wellbeing</h2><div>{careDetails.map(([label]) => <span key={label}><small>{label}</small><b>Yes</b></span>)}</div></section>}
              <div className={styles.copy}>{details.description ? details.description.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>The seller has not added a description for this listing yet.</p>}</div>
            </section>
          </div>
          <aside className={styles.sidebar}>
            <div className={styles.priceCard}>
              <span className={styles.status}><ShieldCheck size={15} aria-hidden="true" /> Available listing</span>
              <p>Listing price</p><strong>{formatPrice(listing.price)}</strong><div className={styles.divider} />
              <span className={styles.location}><MapPin size={16} aria-hidden="true" />{details.location || "Location available on request"}</span>
              <small>Contact the seller directly to ask about care, routine, and availability.</small>
            </div>
            <div className={styles.posterCard}>
              <span className={styles.posterLabel}>Posted by</span>
              <h2><UserRound size={16} aria-hidden="true" />{poster.name}</h2>
              {poster.phone ? <a href={`tel:${poster.phone.replace(/\s/g, "")}`}><Phone size={15} aria-hidden="true" />{poster.phone}</a> : <span className={styles.unavailable}><Phone size={15} aria-hidden="true" />Phone not provided</span>}
              {poster.email ? <a href={`mailto:${poster.email}`}><Mail size={15} aria-hidden="true" />{poster.email}</a> : <span className={styles.unavailable}><Mail size={15} aria-hidden="true" />Email not provided</span>}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );

  return content;
}
