import Link from "next/link";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m12 3 7 3v5c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6l7-3Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="m9.3 12 1.7 1.7 3.8-3.8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const routine = [
  {
    title: "Search",
    description:
      "Browse verified sitters, walkers, and groomers near you, and read real reviews from other owners.",
  },
  {
    title: "Book",
    description:
      "Pick a date, confirm the details, and pay securely through the platform in a couple of taps.",
  },
  {
    title: "Relax",
    description:
      "Enjoy your time away with daily updates and photo check-ins from your sitter.",
  },
];

const services = [
  {
    title: "Boarding",
    description:
      "Your pet stays overnight in a vetted sitter's home, with the same routine they'd get from you.",
  },
  {
    title: "Walking",
    description:
      "On-demand or recurring walks, matched to your dog's energy and your street's rhythm.",
  },
  {
    title: "Grooming",
    description:
      "In-home grooming sessions, from a quick trim to a full wash and brush-out.",
  },
  {
    title: "Training",
    description:
      "One-on-one sessions with certified trainers, built around behaviors you actually want to fix.",
  },
];

const testimonials = [
  {
    quote:
      "Finding a sitter used to be so stressful, but PetSphere made it effortless. Our dog Milo was so happy and we loved the daily photo updates.",
    name: "Sarah Jenkins",
    since: "Pet parent since 2022",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
  },
  {
    quote:
      "The verified sitter process gave me so much confidence. I can finally travel without worrying about my cats. Highly recommend.",
    name: "David Lawson",
    since: "Pet parent since 2023",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
  },
];

const heroImageUrl = "/petcare.jpg";

export default function Home() {
  return (
    <main className="landing-page">
      <section className="hero-section hero-home">
        <div className="hero-media" aria-hidden="true">
          <img
            src={heroImageUrl}
            alt="A golden retriever resting beside a gray cat in a warm, calm pet care setting"
            width="2400"
            height="1600"
            loading="eager"
            fetchPriority="high"
          />
        </div>

        <div className="hero-overlay" aria-hidden="true" />

        <div className="hero-content">
          <p className="hero-pill">
            Premium pet care, wherever life takes you
          </p>

          <h1>
            Peace of mind for <span>every pet</span>
          </h1>

          <p className="hero-description">
            Book trusted sitters, walkers, grooming, and training with one
            refined platform built around your pet&apos;s comfort, safety, and
            routine.
          </p>

          <div className="hero-cta">
            <Link href="/register" className="btn btn-primary">
              Find a sitter
            </Link>

            <Link href="/register" className="btn btn-secondary">
              Become a sitter
            </Link>
          </div>

          <div className="hero-social-proof">
            <div className="hero-proof-stat">
              <strong>50k+</strong>
              <span>Verified sitters</span>
            </div>

            <div className="hero-proof-divider" aria-hidden="true" />

            <div className="hero-proof-stat">
              <strong>24/7</strong>
              <span>Live support</span>
            </div>

            <div className="hero-proof-divider" aria-hidden="true" />

            <div className="hero-proof-stat">
              <strong>4.9/5</strong>
              <span>Average rating</span>
            </div>
          </div>
        </div>

        <div className="hero-badge-card">
          <div className="badge-icon">
            <ShieldIcon />
          </div>

          <div>
            <strong>Verified care</strong>
            <span>Background checked professionals</span>
          </div>
        </div>
      </section>

      <section className="routine-section" id="how-it-works">
        <div className="routine-heading">
          <div>
            <p className="eyebrow">Getting started</p>

            <h2>
              Simple steps to <em>peace of mind</em>
            </h2>
          </div>

          <p>
            Getting premium care for your pet is designed to be effortless.
            Here&apos;s how it works.
          </p>
        </div>

        <div className="routine-strip">
          {routine.map((step, i) => (
            <article key={step.title} className="routine-row">
              <span className="routine-index-num">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="routine-copy">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The index</p>
            <h2>Services, by the job</h2>
          </div>

          <Link href="#services">
            View all services <span>&rarr;</span>
          </Link>
        </div>

        <div className="service-index">
          {services.map((service, i) => (
            <article key={service.title} className="service-row">
              <span className="service-index-num">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>

              <Link href="#services">Explore</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="reviews-section" id="reviews">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Notes from Users</p>
            <h2>What Users say</h2>
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
