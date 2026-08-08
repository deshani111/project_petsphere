import styles from './sidebar.module.css'

const Icon = ({children}) => (
  <span className={styles.navIcon} aria-hidden>
    {children}
  </span>
)

export default function Sidebar(){
  return (
    <aside className={styles.sidebarWrap} aria-label="Sitter navigation">
      <div>
        <a className={styles.brand} href="#">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:22}}>🐾</span>
            <div>
              <div>PetSphere</div>
              <div className={styles.brandSmall}>PET CARE PLATFORM</div>
            </div>
          </div>
        </a>

        <nav className={styles.nav} aria-label="Primary">
          <a className={`${styles.navLink} ${styles.active}`} href="#"> <Icon>📊</Icon> Dashboard</a>
          <a className={styles.navLink} href="#"> <Icon>📅</Icon> My Bookings</a>
          <a className={styles.navLink} href="#"> <Icon>🦴</Icon> My Services</a>
          <a className={styles.navLink} href="#"> <Icon>💸</Icon> Earnings</a>
          <a className={styles.navLink} href="#"> <Icon>💬</Icon> Messages</a>
          <a className={styles.navLink} href="#"> <Icon>📰</Icon> Blogs</a>
          <a className={styles.navLink} href="#"> <Icon>🛒</Icon> Marketplace</a>
          <a className={styles.navLink} href="#"> <Icon>⭐</Icon> Reviews</a>
          <a className={styles.navLink} href="#"> <Icon>👤</Icon> My Profile</a>
        </nav>
      </div>

      <div>
        <div className={styles.bottom}>
          <a className={styles.logout} href="#"> <span>↩</span> Logout</a>
        </div>
      </div>
    </aside>
  )
}
