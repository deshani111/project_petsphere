import styles from "./page.module.css";

export default function Loading() {
  return (
    <section className={styles.page} aria-busy="true">
      <div className={styles.breadcrumbs}>
        <span>ADMIN</span>
        <span>/</span>
        <span>PROFILE SETTINGS</span>
        <span>/</span>
        <span>EDIT PROFILE</span>
      </div>
      <div className={styles.errorBanner}>Loading profile information…</div>
      <div className={styles.layout}>
        <div className={styles.photoCard}>
          <h2>Profile Photo</h2>
          <div className={styles.photoStage}>
            <div className={styles.avatarWrap}><span className={styles.avatar}>AU</span></div>
            <div className={styles.errorBanner}>Loading avatar and profile details…</div>
          </div>
        </div>
        <div className={styles.formCard}>
          <h2>Personal Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}><span className={styles.inputLabel}>Full Name</span><div className={styles.inputShell} /></div>
            <div className={styles.inputGroup}><span className={styles.inputLabel}>Email Address</span><div className={styles.inputShell} /></div>
            <div className={styles.inputGroup}><span className={styles.inputLabel}>Location</span><div className={styles.inputShell} /></div>
            <div className={styles.inputGroup}><span className={styles.inputLabel}>Admin Role</span><div className={styles.inputShell} /></div>
            <div className={styles.inputGroup}><span className={styles.inputLabel}>Staff ID</span><div className={styles.inputShell} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
