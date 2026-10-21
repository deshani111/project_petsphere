import styles from "../page.module.css";

export default function SummaryCard({ label, value, detail, icon: Icon, featured = false, alert = false }) {
  return (
    <article className={`${styles.summaryCard} ${featured ? styles.summaryFeatured : ""} ${alert ? styles.summaryAlert : ""}`}>
      <div className={styles.summaryTop}><span>{label}</span><span className={styles.summaryIcon}><Icon size={17} strokeWidth={1.8} aria-hidden="true" /></span></div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
