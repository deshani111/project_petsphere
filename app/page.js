const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="5.8" stroke="currentColor" strokeWidth="1.8" />
    <path d="m16 16 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="6.5" width="16" height="13" rx="2.6" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 4v4M16 4v4M4 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const SmileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9.2 14.2c.9 1 1.9 1.5 2.8 1.5s1.9-.5 2.8-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="9.2" cy="10.2" r="1" fill="currentColor" />
    <circle cx="14.8" cy="10.2" r="1" fill="currentColor" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.6v-6.1H9.6V20H5a1 1 0 0 1-1-1v-7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const PawIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12.2 13.5c-2.1-2.6-6.7.5-4.7 3.8.9 1.5 3.8 1.2 4.7-.5.9 1.7 3.8 2 4.7.5 2-3.3-2.6-6.4-4.7-3.8Z" fill="currentColor" />
    <ellipse cx="5.9" cy="9.2" rx="1.9" ry="2.4" transform="rotate(-28 5.9 9.2)" fill="currentColor" />
    <ellipse cx="9.9" cy="6.4" rx="1.7" ry="2.3" transform="rotate(-10 9.9 6.4)" fill="currentColor" />
    <ellipse cx="14.5" cy="6.4" rx="1.7" ry="2.3" transform="rotate(10 14.5 6.4)" fill="currentColor" />
    <ellipse cx="18.5" cy="9.2" rx="1.9" ry="2.4" transform="rotate(28 18.5 9.2)" fill="currentColor" />
  </svg>
);

const ScissorsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="6.5" cy="7.5" r="2.8" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="6.5" cy="16.5" r="2.8" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 9.5 20 4M9 14.5 20 20M9.3 9.8 16 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 10.5 12 5l9 5.5-9 5.5-9-5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M7 13.4V17c0 1.6 2.2 2.8 5 2.8s5-1.2 5-2.8v-3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20.8 8.5c0 5.2-8.8 10.1-8.8 10.1S3.2 13.7 3.2 8.5A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.8 1.9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m12 3 7 3v5c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="m9.3 12 1.7 1.7 3.8-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const statItems = [
  { value: "50k+", label: "Verified Sitters", icon: <PawIcon /> },
  { value: "Secure", label: "Payments", icon: <ShieldIcon /> },
  { value: "24/7", label: "Support", icon: <SmileIcon /> },
  { value: "100k+", label: "Happy Pets", icon: <HeartIcon /> },
];

const steps = [
  { title: "Search", description: "Browse verified sitters in your neighborhood and read real owner reviews.", icon: <SearchIcon /> },
  { title: "Book", description: "Schedule dates and pay securely through our protected platform.", icon: <CalendarIcon /> },
  { title: "Relax", description: "Enjoy your time away with daily updates and photo check-ins.", icon: <SmileIcon /> },
];

const services = [
  { title: "Boarding", description: "Your pet stays overnight in the sitter's home. They'll be treated like family.", icon: <HomeIcon /> },
  { title: "Walking", description: "Daily walks to keep your furry friends active and happy while you're busy.", icon: <PawIcon /> },
  { title: "Grooming", description: "In-home grooming sessions to keep your pets looking and smelling their best.", icon: <ScissorsIcon /> },
  { title: "Training", description: "One-on-one sessions with certified trainers to master new behaviors.", icon: <CapIcon /> },
];

const testimonials = [
  {
    quote: "Finding a sitter used to be so stressful, but PetSphere made it effortless. Our dog Milo was so happy and we loved the daily photo updates!",
    name: "Sarah Jenkins",
    since: "Pet Parent Since 2022",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
  },
  {
    quote: "The verified sitter process gave me so much confidence. I can finally travel without worrying about my cats. Highly recommend!",
    name: "David Lawson",
    since: "Pet Parent Since 2023",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
  },
];

export default function Home() {
  return (
    <main className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-pill">Trusted by 50k+ pet owners</p>
          <h1>
            Trusted Pet Care, <span>On Your Schedule</span>
          </h1>
          <p className="hero-description">
            Connecting pet owners with verified, background-checked sitters who treat your pets like family.
            Experience total peace of mind with real-time updates.
          </p>
          <div className="hero-cta">
            <a href="#services" className="btn btn-primary">Find a Sitter <span>&rsaquo;</span></a>
            <a href="#services" className="btn btn-secondary">Become a Sitter</a>
          </div>
          <div className="hero-social-proof">
            <div className="owner-avatars">
              <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=80&q=80" alt="" />
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="" />
              <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=80&q=80" alt="" />
            </div>
            <div>
              <p className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
              <small>Joined by 10k+ owners this month</small>
            </div>
          </div>
        </div>

        <div className="hero-image-wrap">
          <div className="hero-image-frame">
            <img
              src="/home-hero-pets-window.jpg"
              alt="A cat and dog relaxing together on a bright window seat"
              width="900"
              height="520"
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <div className="badge-card">
            <div className="badge-icon"><ShieldIcon /></div>
            <div>
              <strong>100%</strong>
              <span>Background Checked</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip" aria-label="PetSphere stats">
        {statItems.map((item) => (
          <article key={item.label} className="stat-item">
            <div className="stat-icon">{item.icon}</div>
            <div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="steps-section" id="how-it-works">
        <h2>Simple Steps to Peace of Mind</h2>
        <p>Getting premium care for your pet is designed to be effortless. Follow our streamlined process.</p>
        <div className="steps-grid">
          {steps.map((step) => (
            <article key={step.title} className="step-item">
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="section-heading">
          <div>
            <h2>Tailored Services</h2>
            <p>Whatever your pet needs, we have the right expert for the job.</p>
          </div>
          <a href="#services">View All Services <span>&rarr;</span></a>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article key={service.title} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a href="#services">Explore <span>&rarr;</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="reviews-section" id="reviews">
        <div className="section-heading">
          <div>
            <h2>What Owners Say</h2>
            <p>Real stories from our community of pet parents.</p>
          </div>
          <div className="review-controls" aria-hidden="true">
            <button type="button">&larr;</button>
            <button type="button">&rarr;</button>
          </div>
        </div>
        <div className="review-grid">
          {testimonials.map((review) => (
            <article key={review.name} className="review-card">
              <p className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
              <blockquote>{review.quote}</blockquote>
              <div className="review-author">
                <img src={review.avatar} alt={review.name} />
                <div>
                  <strong>{review.name}</strong>
                  <span>{review.since}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </main>
  );
}
