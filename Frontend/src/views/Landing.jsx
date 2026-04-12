import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll('.animate-on-scroll, .animate-zoom-in');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-navbar animate-on-scroll">
        <div className="nav-logo">LexArena</div>
        <div className="nav-actions">
          <button className="nav-cta" onClick={() => navigate('/login')}>Login</button>
          <div className="nav-profile-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section" id="bench">
        <div className="hero-background animate-zoom-in" style={{ backgroundImage: "url('/indian_courtroom_bg.png')" }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-subtitle animate-on-scroll">LexArena ARCHITECTURE</span>
          <h1 className="hero-title animate-on-scroll delay-1">The Future of<br />Legal Advocacy.</h1>
          <p className="hero-description animate-on-scroll delay-2">
            An immersive, virtual courtroom simulation engineered for the next generation of litigators. Master the art of the brief through computational scholarly rigor.
          </p>
          <div className="hero-buttons animate-on-scroll delay-3">
            <button className="btn-primary" onClick={() => navigate('/login')}>COMMENCE YOUR FIRST TRIAL</button>
            <button className="btn-outline">REVIEW PRECEDENTS</button>
          </div>
        </div>
      </header>


      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="features-header animate-on-scroll">
          <h2 className="features-title">Editorial Command. Digital Precision.</h2>
          <p className="features-description">
            We bridge the gap between archaic tradition and modern computation, providing tools that demand focus and promote intellectual growth.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card animate-on-scroll delay-1">
            <div className="feature-icon">
              {/* Gavel icon SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 13-7.5 7.5c-.8.8-2.1.8-2.9 0-0.8-.8-0.8-2.1 0-2.9L11 10"/><path d="m16 16 6-6-4-4-6 6"/><path d="m8 8 2-2"/></svg>
            </div>
            <h3 className="feature-card-title">AI-Driven Judges</h3>
            <p className="feature-card-desc">
              Our proprietary LLM-based bench provides real-time, context-aware objections and procedural challenges, mimicking the temperaments of historical jurists.
            </p>
          </div>
          <div className="feature-card animate-on-scroll delay-2">
            <div className="feature-icon">
              {/* Transcript/Head icon SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 1.9.8 3.7 2 5v4l4-2 4 2v-4c1.2-1.3 2-3.1 2-5a8 8 0 0 0-8-8Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            </div>
            <h3 className="feature-card-title">Real-time Transcript Analytics</h3>
            <p className="feature-card-desc">
              Instant semantic analysis of your oral arguments. Identify logical fallacies and emotional resonance scores as you speak.
            </p>
          </div>
          <div className="feature-card animate-on-scroll delay-3" id="precedents">
            <div className="feature-icon">
              {/* Library/Book icon SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <h3 className="feature-card-title">Comprehensive Precedent Library</h3>
            <p className="feature-card-desc">
              Access over 200 years of curated case law, indexed specifically for moot court competition themes and common legal challenges.
            </p>
          </div>
        </div>
      </section>


      {/* Bottom CTA Section */}
      <section className="bottom-cta-section" id="pricing">
        <div className="bottom-cta-card animate-on-scroll">
          <div className="cta-left">
            <h2 className="cta-title">Ready to defend your thesis?</h2>
            <p className="cta-desc">
              Join thousands of legal scholars refining their craft. Start your first AI-mediated session today and receive a detailed judicial feedback report within minutes.
            </p>
          </div>
          <div className="cta-right">
            <button className="btn-light" onClick={() => navigate('/login')}>ENTER THE COURTROOM</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-left">
          <div className="footer-logo">LexArena</div>
          <div className="footer-copyright">
            © 2025 LexArena. ALL RIGHTS RESERVED. FORGING SCHOLARLY RIGOR VIA INTRA-NET.
          </div>
        </div>
        <div className="footer-right">
          <a href="#terms">TERMS OF SERVICE</a>
          <a href="#privacy">PRIVACY POLICY</a>
          <a href="#institutional">INSTITUTIONAL ACCESS</a>
          <a href="#support">SUPPORT</a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
