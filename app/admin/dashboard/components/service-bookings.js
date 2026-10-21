import styles from "../page.module.css";

export default function ServiceBookings({ services }) {
  const entries = [...services].sort((first, second) => second.bookings - first.bookings).slice(0, 5);
  const total = services.reduce((sum, service) => sum + service.bookings, 0);

  if (!entries.length || total === 0) return <p className={styles.emptyState}>Service booking data will appear here.</p>;

  return (
    <div className={styles.serviceList}>
      {entries.map((service, index) => {
        const percentage = (service.bookings / total) * 100;
        return (
          <div className={styles.serviceRow} key={service.name}>
            <div className={styles.serviceMeta}>
              <span><i className={index === 0 ? styles.topService : ""} />{service.name}</span>
              <span className={styles.serviceNumbers}><strong>{service.bookings.toLocaleString("en-US")}</strong><small>{percentage.toFixed(1)}%</small></span>
            </div>
            <div className={styles.serviceTrack} role="img" aria-label={`${service.name}: ${service.bookings} bookings, ${percentage.toFixed(1)} percent`}><span style={{ width: `${percentage}%` }} /></div>
          </div>
        );
      })}
      <div className={styles.serviceTotal}><span>Bookings across listed services</span><strong>{total.toLocaleString("en-US")}</strong></div>
    </div>
  );
}
