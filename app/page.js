const PawIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 13.35c-2.25-3.1-7.2.55-5.06 4.15 1.02 1.7 4.1 1.34 5.06-.64.96 1.98 4.04 2.34 5.06.64 2.14-3.6-2.81-7.25-5.06-4.15Z" fill="currentColor" />
    <ellipse cx="5.18" cy="8.82" rx="2.08" ry="2.76" transform="rotate(-30 5.18 8.82)" fill="currentColor" />
    <ellipse cx="9.7" cy="5.9" rx="2.05" ry="2.75" transform="rotate(-8 9.7 5.9)" fill="currentColor" />
    <ellipse cx="14.3" cy="5.9" rx="2.05" ry="2.75" transform="rotate(8 14.3 5.9)" fill="currentColor" />
    <ellipse cx="18.82" cy="8.82" rx="2.08" ry="2.76" transform="rotate(30 18.82 8.82)" fill="currentColor" />
  </svg>
);

const ShieldIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 19 6v5c0 4.35-2.96 8.38-7 10-4.04-1.62-7-5.65-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" /><path d="m9.2 12 1.85 1.85 3.85-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const PaymentIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M3 10h18M7 15h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
const SupportIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-2v-5h4M4 13h4v5H6a2 2 0 0 1-2-2v-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 20h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
const HeartIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.8 8.6c0 5.3-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.6A4.6 4.6 0 0 1 12 6.75 4.6 4.6 0 0 1 20.8 8.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const trustItems = [
  { label: "50k+", detail: "Verified sitters", icon: <PawIcon size={22} /> },
  { label: "Secure", detail: "Payments", icon: <ShieldIcon /> },
  { label: "24/7", detail: "Support", icon: <SupportIcon /> },
  { label: "100k+", detail: "Happy pets", icon: <HeartIcon /> },
];

export default function Home() {
  return (
    <main>
      <nav className="navbar" aria-label="Primary navigation">
        <a className="brand" href="#home" aria-label="PetSphere home"><PawIcon size={21} /> <span>PetSphere</span></a>
        <div className="nav-links">
          <a className="active" href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#find">Find a Sitter</a>
          <a href="#become">Become a Sitter</a>
          <a href="#blog">Blog</a>
          <a href="#marketplace">Marketplace</a>
        </div>
        <div className="nav-account">
          <a className="dashboard-button" href="#dashboard">Dashboard</a>
          <a className="profile-link" href="#profile">Alex Johnson</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span></span> Trusted by 50k+ pet owners</div>
          <h1>Trusted Pet Care,<br /><em>On Your Schedule</em></h1>
          <p>Connecting pet owners with verified, background-checked sitters who treat your pets like family. Experience total peace of mind with real-time updates.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#find">Find a Sitter <b>›</b></a>
            <a className="secondary-button" href="#become">Become a Sitter</a>
          </div>
          <div className="social-proof">
            <div className="avatars" aria-label="Happy PetSphere customers">
              <img src="https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=80&q=80" alt="" />
              <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=80&q=80" alt="" />
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="" />
            </div>
            <div><div className="stars">★★★★★</div><small>Joined by 10k+ owners this month</small></div>
          </div>
        </div>

        <div className="hero-visual" aria-label="A pet sitter cuddles a dog in a bright home">
          <div className="visual-backdrop"></div>
          <div className="photo-frame">
            <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=85" alt="A woman caring for a happy dog indoors" />
          </div>
          <div className="verification-card">
            <div className="verified-icon"><ShieldIcon /></div>
            <div><strong>100%</strong><span>Background checked</span></div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="PetSphere benefits">
        {trustItems.map((item) => <article className="trust-item" key={item.detail}>
          <div className="trust-icon">{item.icon}</div>
          <div><strong>{item.label}</strong><span>{item.detail}</span></div>
        </article>)}
      </section>
    </main>
  );
}
