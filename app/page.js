const PawIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 13.35c-2.25-3.1-7.2.55-5.06 4.15 1.02 1.7 4.1 1.34 5.06-.64.96 1.98 4.04 2.34 5.06.64 2.14-3.6-2.81-7.25-5.06-4.15Z" fill="currentColor" />
    <ellipse cx="5.18" cy="8.82" rx="2.08" ry="2.76" transform="rotate(-30 5.18 8.82)" fill="currentColor" />
    <ellipse cx="9.7" cy="5.9" rx="2.05" ry="2.75" transform="rotate(-8 9.7 5.9)" fill="currentColor" />
    <ellipse cx="14.3" cy="5.9" rx="2.05" ry="2.75" transform="rotate(8 14.3 5.9)" fill="currentColor" />
    <ellipse cx="18.82" cy="8.82" rx="2.08" ry="2.76" transform="rotate(30 18.82 8.82)" fill="currentColor" />
  </svg>
);

const BellIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 17H9m7-6a4 4 0 1 0-8 0c0 4-2 5-2 5h12s-2-1-2-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const CalendarIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 3v4M16 3v4M4 9h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
const StarIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 4 2.7 5.46 6.03.88-4.36 4.25 1.03 6.02L12 17.8l-5.4 2.81 1.03-6.02-4.36-4.25 6.03-.88L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
const WalletIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H20v12.5A1.5 1.5 0 0 1 18.5 19H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.8" /><path d="M15 11h5v4h-5a2 2 0 1 1 0-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
const ChartIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19h14M7 17V9m5 8V5m5 12v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
const MessageIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 6h14v9H9l-4 4V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
const SettingsIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8 3.5-1.7.7a6.8 6.8 0 0 1-.4 1l.9 1.6-1.8 1.8-1.6-.9a6.8 6.8 0 0 1-1 .4L13.5 20h-3l-.7-1.7a6.8 6.8 0 0 1-1-.4l-1.6.9-1.8-1.8.9-1.6a6.8 6.8 0 0 1-.4-1L3 12l1.7-.7a6.8 6.8 0 0 1 .4-1l-.9-1.6 1.8-1.8 1.6.9a6.8 6.8 0 0 1 1-.4L10.5 4h3l.7 1.7a6.8 6.8 0 0 1 1 .4l1.6-.9 1.8 1.8-.9 1.6a6.8 6.8 0 0 1 .4 1L20 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>;
const PawBadge = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 13.35c-2.25-3.1-7.2.55-5.06 4.15 1.02 1.7 4.1 1.34 5.06-.64.96 1.98 4.04 2.34 5.06.64 2.14-3.6-2.81-7.25-5.06-4.15Z" fill="currentColor" /><ellipse cx="5.18" cy="8.82" rx="2.08" ry="2.76" transform="rotate(-30 5.18 8.82)" fill="currentColor" /><ellipse cx="9.7" cy="5.9" rx="2.05" ry="2.75" transform="rotate(-8 9.7 5.9)" fill="currentColor" /><ellipse cx="14.3" cy="5.9" rx="2.05" ry="2.75" transform="rotate(8 14.3 5.9)" fill="currentColor" /><ellipse cx="18.82" cy="8.82" rx="2.08" ry="2.76" transform="rotate(30 18.82 8.82)" fill="currentColor" /></svg>;

const sidebarLinks = [
  { label: "Dashboard", active: true, icon: <WalletIcon /> },
  { label: "My Bookings", icon: <CalendarIcon /> },
  { label: "My Services", icon: <SettingsIcon /> },
  { label: "Earnings", icon: <ChartIcon /> },
  { label: "Messages", icon: <MessageIcon /> },
  { label: "Blogs", icon: <PawIcon size={18} /> },
  { label: "Marketplace", icon: <PawIcon size={18} /> },
  { label: "Reviews", icon: <StarIcon /> },
  { label: "My Profile", icon: <SettingsIcon /> },
];

const statCards = [
  { label: "This Month's Earnings", value: "LKR 1,240.00", meta: "+12%", icon: <WalletIcon /> },
  { label: "Upcoming Bookings", value: "8 Confirmed", meta: "Next: Bruno (Dog Walking)", icon: <CalendarIcon /> },
  { label: "Average Rating", value: "4.9 Stars", meta: "From 128 verified reviews", icon: <StarIcon /> },
  { label: "Active Services", value: "3 Listed", meta: "Walking, Boarding, Sitting", icon: <SettingsIcon /> },
];

const requests = [
  { name: "Bruno", pet: "Boxer", owner: "Mark Davis", service: "Dog Walking", dates: "Oct 24 - Oct 26", status: "Pending" },
  { name: "Luna", pet: "Samoyed", owner: "Elena Rodriguez", service: "Pet Sitting", dates: "Oct 28 - Oct 30", status: "Pending" },
];

const bookings = [
  { pet: "Buddy", owner: "Alice Thompson", service: "Dog Walking", date: "Oct 25, 2023", time: "09:00 AM", status: "Confirmed" },
  { pet: "Shadow", owner: "James Wilson", service: "Pet Boarding", date: "Oct 26, 2023", time: "Check-in 2:00 PM", status: "Confirmed" },
  { pet: "Mittens", owner: "Sophie Lee", service: "Pet Sitting", date: "Oct 27, 2023", time: "06:30 PM", status: "Confirmed" },
];

const quickActions = [
  { title: "Messages", detail: "3 unread chats", icon: <MessageIcon /> },
  { title: "Manage Services", detail: "Update your offerings", icon: <SettingsIcon /> },
  { title: "My Profile", detail: "Keep your info current", icon: <PawBadge /> },
];

export default function Home() {
  return (
    <main className="dashboard-shell">
      <aside className="sidebar" aria-label="Sidebar navigation">
        <div>
          <a className="brand brand-side" href="#dashboard" aria-label="PetSphere dashboard home">
            <PawIcon size={22} />
            <span>
              PetSphere
              <small>PET CARE PLATFORM</small>
            </span>
          </a>

          <nav className="sidebar-nav">
            {sidebarLinks.map((link) => (
              <a key={link.label} className={link.active ? "sidebar-link active" : "sidebar-link"} href="#dashboard">
                <span className="sidebar-icon">{link.icon}</span>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <a className="sidebar-logout" href="#logout">
          <span className="sidebar-icon"><MessageIcon /></span>
          Logout
        </a>
      </aside>

      <section className="dashboard-main" id="dashboard">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-copy">
            <p className="eyebrow-small">Sitter Dashboard</p>
            <h1>Welcome back Sarah!</h1>
            <div className="status-pill">
              <span></span>
              Verified Professional
            </div>
          </div>

          <div className="topbar-actions">
            <button type="button" className="icon-button" aria-label="Notifications">
              <BellIcon />
            </button>
            <div className="profile-chip">
              <div className="avatar">SJ</div>
              <span>Sarah Jenkins</span>
            </div>
          </div>
        </header>

        <section className="stats-grid" aria-label="Dashboard metrics">
          {statCards.map((card) => (
            <article className="stat-card" key={card.label}>
              <div className="stat-card-head">
                <p>{card.label}</p>
                <span className="stat-icon">{card.icon}</span>
              </div>
              <strong>{card.value}</strong>
              <small>{card.meta}</small>
            </article>
          ))}
        </section>

        <section className="content-grid" aria-label="Booking overview">
          <div className="panel panel-wide">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Pending Requests</p>
                <h2>2</h2>
              </div>
              <a href="#requests">View All</a>
            </div>

            <div className="request-grid" id="requests">
              {requests.map((request) => (
                <article className="request-card" key={request.name}>
                  <div className="request-top">
                    <div className="request-avatar">{request.name.slice(0, 1)}</div>
                    <div>
                      <strong>{request.name} ({request.pet})</strong>
                      <p>Owner: {request.owner}</p>
                    </div>
                    <span className="request-status">{request.status.toUpperCase()}</span>
                  </div>
                  <div className="request-meta">
                    <span>{request.service}</span>
                    <span>{request.dates}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="panel quick-actions-panel" aria-label="Quick actions">
            <div className="panel-header compact">
              <div>
                <p className="panel-kicker">Quick Actions</p>
                <h2>Tools</h2>
              </div>
            </div>

            <div className="quick-actions-list">
              {quickActions.map((action) => (
                <a href="#action" className="action-card" key={action.title}>
                  <span className="action-icon">{action.icon}</span>
                  <div>
                    <strong>{action.title}</strong>
                    <p>{action.detail}</p>
                  </div>
                </a>
              ))}
            </div>
          </aside>
        </section>

        <section className="panel bookings-panel" aria-label="Upcoming confirmed bookings">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Upcoming Confirmed Bookings</p>
              <h2>Schedule</h2>
            </div>
            <button type="button" className="filter-button" aria-label="Filter bookings">
              <span>☰</span>
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pet & Owner</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={`${booking.pet}-${booking.date}`}>
                    <td>
                      <div className="booking-person">
                        <div className="booking-avatar">{booking.pet.slice(0, 1)}</div>
                        <div>
                          <strong>{booking.pet}</strong>
                          <span>Owner: {booking.owner}</span>
                        </div>
                      </div>
                    </td>
                    <td>{booking.service}</td>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td><span className="status-badge confirmed">{booking.status}</span></td>
                    <td><button type="button" className="more-button" aria-label={`Actions for ${booking.pet}`}>⋮</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
