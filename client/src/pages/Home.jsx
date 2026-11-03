import { Link } from "react-router";
import "./Home.css";

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">
            Learn together. Achieve more.
          </span>

          <h1>StudyCircle</h1>
          <p className="home-tagline">
            Find your study group.
          </p>

          <p className="home-description">
            Studying is better together. Discover study sessions,
            connect with classmates, and make progress toward
            your academic goals.
          </p>

          <div className="home-actions">
            <Link to="/browse" className="home-primary-btn">
              Get Started
            </Link>
            <Link to="/browse" className="home-secondary-btn">
              Browse Sessions
            </Link>
          </div>
        </div>

        <div className="home-hero-art" aria-hidden="true">
          <span>📚</span>
          <p>Find your circle. Reach your goals.</p>
        </div>
      </section>

      <section className="home-features">
        <h2>Why StudyCircle?</h2>

        <div className="home-feature-grid">
          <article className="home-feature-card">
            <span className="home-feature-icon">🔎</span>
            <h3>Find Study Sessions</h3>
            <p>
              Explore upcoming study groups based on your
              courses and interests.
            </p>
          </article>

          <article className="home-feature-card">
            <span className="home-feature-icon">👥</span>
            <h3>Connect With Students</h3>
            <p>
              Meet classmates, share knowledge, and learn
              together in a supportive environment.
            </p>
          </article>

          <article className="home-feature-card">
            <span className="home-feature-icon">📅</span>
            <h3>Organize Your Sessions</h3>
            <p>
              Plan study sessions and invite other students
              to join you.
            </p>
          </article>
        </div>
      </section>

      <section className="home-bottom-cta">
        <h2>Ready to start studying together?</h2>
        <Link to="/browse" className="home-primary-btn">
          Explore Study Sessions
        </Link>
      </section>

      <footer className="home-footer">
        <span>StudyCircle</span>
        <span>© 2026 StudyCircle</span>
      </footer>
    </main>
  );
}

export default Home;
