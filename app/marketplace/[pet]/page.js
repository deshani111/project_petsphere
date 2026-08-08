import { notFound } from "next/navigation";
import styles from "./page.module.css";

const pets = {
  cooper: { name: "Cooper", breed: "Golden Retriever", price: "Rs. 62,000.00", age: "3 Months", gender: "Female", image: "/marketplace-cooper.jpg", health: "Certified", training: "Advanced", story: "Meet Cooper, a charming and affectionate 3-year-old Golden Retriever looking for her forever home. She has been raised in a clean, loving home environment and is well-socialized with both people and other pets. Cooper loves gentle walks, interactive play, and relaxing by the fireplace during the evenings.", note: "She is fully house-trained, healthy, and up-to-date on all vaccinations and check-ups. Cooper is known for her calm temperament, making her a wonderful companion for families, working professionals, or anyone looking for a loyal best friend.", life: ["/marketplace-cooper.jpg", "/blog-training.jpg", "/blog-featured-puppy.jpg", "/marketplace-snow.jpg", "/blog-dog-health.jpg"] },
  luna: { name: "Luna", breed: "Siberian Husky", price: "Rs. 85,000.00", age: "1.5 Years", gender: "Female", image: "/marketplace-luna.jpg", health: "Healthy", training: "Trained", story: "Luna is a bright, energetic Siberian Husky with a gentle temperament and a curious spirit. She enjoys outdoor adventures, steady routines, and people who can match her playful energy.", note: "She is socialized, well cared for, and looking for a home that understands her need for regular exercise, calm leadership, and plenty of affection.", life: ["/marketplace-luna.jpg", "/marketplace-snow.jpg", "/blog-training.jpg", "/blog-featured-puppy.jpg", "/blog-dog-health.jpg"] },
  midnight: { name: "Midnight", breed: "Bengal Mix", price: "Rs. 50,000.00", age: "2 Years", gender: "Male", image: "/blog-cat-behavior.jpg", health: "Certified", training: "Litter Trained", story: "Midnight is a striking Bengal Mix with a calm indoor nature and a playful spark. He loves sunny windows, quiet company, and a cozy spot to watch the world go by.", note: "He is healthy, indoor-ready, and appreciates a gentle home with room for daily play and plenty of restful time.", life: ["/blog-cat-behavior.jpg", "/blog-dog-health.jpg", "/marketplace-cooper.jpg", "/marketplace-luna.jpg", "/marketplace-snow.jpg"] },
  bella: { name: "Bella", breed: "French Bulldog", price: "Rs. 180,000.00", age: "4 Months", gender: "Female", image: "/blog-training.jpg", health: "Certified", training: "Basic", story: "Bella is a cheerful French Bulldog puppy with a loving personality and a soft spot for playtime. She is happiest close to people and quickly makes a home feel brighter.", note: "She is registered, carefully cared for, and ready to continue her training in a patient, welcoming home.", life: ["/blog-training.jpg", "/marketplace-cooper.jpg", "/blog-featured-puppy.jpg", "/marketplace-snow.jpg", "/blog-dog-health.jpg"] },
  oliver: { name: "Oliver", breed: "Parrot", price: "Rs. 35,000.00", age: "5 Years", gender: "Male", image: "/marketplace-oliver.jpg", health: "Healthy", training: "Talkative", story: "Oliver is a colorful, social parrot with a big personality. He enjoys conversation, engaging enrichment, and being part of a lively but thoughtful household.", note: "He is healthy and happiest with an experienced bird-loving family who can give him daily interaction and a stimulating environment.", life: ["/marketplace-oliver.jpg", "/marketplace-snow.jpg", "/blog-cat-behavior.jpg", "/marketplace-cooper.jpg", "/blog-training.jpg"] },
  snow: { name: "Snow", breed: "Samoyed", price: "Rs. 210,000.00", age: "6 Months", gender: "Female", image: "/marketplace-snow.jpg", health: "Certified", training: "Socialized", story: "Snow is a happy, fluffy Samoyed with a gentle, friendly personality. She loves people, outdoor walks, and being included in everyday family life.", note: "She is purebred, socialized, and ready for a caring home that can offer companionship, brushing, and plenty of playful exercise.", life: ["/marketplace-snow.jpg", "/marketplace-luna.jpg", "/blog-training.jpg", "/marketplace-cooper.jpg", "/blog-featured-puppy.jpg"] },
};

export default async function PetProfilePage({ params }) {
  const { pet: slug } = await params;
  const pet = pets[slug];
  if (!pet) notFound();

  return (
    <main className={styles.profilePage}>
      <section className={styles.profileContent}>
        <a className={styles.backLink} href="/marketplace">&larr; <strong>{pet.name}</strong> the {pet.breed}</a>
        <div className={styles.topGrid}>
          <div className={styles.gallery}><div className={styles.mainImage}><img src={pet.image} alt={pet.name} /></div></div>
          <aside className={styles.sidePanel}><div className={styles.priceCard}><small>Listing Price</small><strong>{pet.price}</strong></div><div className={styles.contactCard}><h2>Contact Information</h2><div className={styles.owner}><span>AR</span><div><strong>Alex Rivera</strong><small>★ 4.9 (24 Reviews)</small></div></div><a href="tel:+94776555443"><span>⌕</span><div><small>PHONE NUMBER</small><strong>+94 776 555 443</strong></div></a><a href="mailto:alex.rivera@gmail.com"><span>✉</span><div><small>EMAIL ADDRESS</small><strong>alex.rivera@gmail.com</strong></div></a></div></aside>
        </div>
        <section className={styles.story}><header><h1>My Story</h1><span>Location: Colombo 06, Sri Lanka</span></header><p>{pet.story}</p><p>{pet.note}</p><div className={styles.facts}><div><small>AGE</small><strong>{pet.age}</strong></div><div><small>GENDER</small><strong>{pet.gender}</strong></div><div><small>HEALTH</small><strong>{pet.health}</strong></div><div><small>TRAINING</small><strong>{pet.training}</strong></div></div></section>
        <section className={styles.life}><h2>{pet.name}&apos;s Life</h2><div>{pet.life.map((image, index) => <img key={`${image}-${index}`} src={image} alt="" />)}</div></section>
      </section>
    </main>
  );
}
