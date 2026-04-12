import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (caseId) => {
    navigate(`/case/${encodeURIComponent(caseId)}`, { state: { caseId } });
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      window.location.href = '/';
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link to="/" className="sidebar-header">
          <div className="logo-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div className="logo-text">
            <h2>Lex Arena</h2>
            <span>LEGAL SIMULATION</span>
          </div>
        </Link>

        <nav className="sidebar-nav">
          <a className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            DASHBOARD
          </a>
          <a className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            CASE LIBRARY
          </a>
        </nav>

        <div className="sidebar-bottom">
          <a className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            SUPPORT
          </a>
          <a className="nav-item logout-item" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            LOGOUT
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-nav">
          <div className="top-nav-left">
            <h3 className="brand-title">JUDICIAL EDITORIAL</h3>
            <div className="top-nav-links">
              <a>DASHBOARD</a>
              <a className="active">CASE LIBRARY</a>
            </div>
          </div>
          <div className="top-nav-right">
            <div className="search-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Search precedents..." />
            </div>
            <div className="nav-icons">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <div className="avatar"></div>
            </div>
          </div>
        </header>

        <div className="page-header">
          <div className="page-header-content">
            <span className="subtitle">JUDICIAL ARCHIVE</span>
            <h1 className="title">Case Library</h1>
            <p className="description">Explore a comprehensive repository of legal precedents, judicial opinions, and foundational cases that shape contemporary jurisprudence.</p>
          </div>
          <div className="page-header-actions">
          </div>
        </div>

        <div className="featured-section">
          <div className="featured-card">
            <div className="featured-content">
              <span className="featured-label">EDITORIAL SELECTION • SUPREME COURT OF INDIA</span>
              <h2>Justice K.S. Puttaswamy (Retd.) v. Union of India</h2>
              <span className="case-citation-meta">2017 • Nine-Judge Constitutional Bench</span>
              <p>Establishing the fundamental right to privacy under Article 21. This landmark ruling introduced the triple test of legality, necessity, and proportionality for state intervention, fundamentally reshaping Indian digital and personal jurisprudence.</p>
              <div className="featured-card-actions">
                <button className="btn-solid" onClick={() => handleCardClick('CASE #IND-001')}>EXAMINE FULL PRECEDENT</button>
              </div>
            </div>
          </div>
          
          <div className="upcoming-features-sidebar">
            <h3 className="section-title">UPCOMING FEATURES</h3>
            <ul className="features-list">
              <li>
                <strong>Interactive Bench Reactions</strong>
                <span>Dynamic visual feedback from the Judge's avatar (nodding, skepticism) based on real-time AI scoring.</span>
              </li>
              <li>
                <strong>Live 1v1 Interaction</strong>
                <span>Practise in a live proceeding against human opponents to experience true adversarial debate.</span>
              </li>
              <li>
                <strong>Voice-to-Argument</strong>
                <span>Full integration with Web Speech API for immersive oral advocacy and presentation training.</span>
              </li>
              <li>
                <strong>Multi-Jurisdiction Library</strong>
                <span>Expanding beyond Constitutional Law into Criminal, Corporate, and International law modules.</span>
              </li>
              <li>
                <strong>Advanced Legal Analytics</strong>
                <span>In-depth reports covering sentiment analysis, win/loss ratios, and specific identification of legal blunders.</span>
              </li>
              <li>
                <strong>Global Competency Platform</strong>
                <span>Access a global leaderboard to network with experienced individuals and gain prestige in the legal community.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="filters-bar">
          <div className="filters-left">
            <span className="filter-label">REFINE RESULTS:</span>
            <span className="pill active">RECENT</span>
            <span className="pill">FUNDAMENTAL RIGHTS</span>
            <span className="pill">CRIMINAL LAW</span>
            <span className="pill">ENVIRONMENT</span>
            <span className="pill">LABOUR</span>
          </div>
          <div className="filters-right">
            <span>Displaying 1-100 of 100 Indian SC cases</span>
          </div>
        </div>

        <div className="cases-grid">
          <div className="case-card" onClick={() => handleCardClick('CASE #IND-001')} style={{ cursor: 'pointer' }}>
            <div className="case-card-header">
              <span className="case-id">CASE #IND-001</span>
            </div>
            <h3>Sharma v. Union of India</h3>
            <span className="case-citation">(2019) Supreme Court of India</span>
            <div className="case-tags">
              <span className="tag tag-pink">PRIVACY</span>
              <span className="tag">ARTICLE 21</span>
            </div>
            <p>Mandatory collection of biometric data for private commercial services without legislative backing violates the right to privacy under Article 21.</p>
            <div className="case-card-footer">
              <span className="view-link">VIEW PRECEDENT</span>
              <span className="citations">Aadhaar · Biometrics</span>
            </div>
          </div>

          <div className="case-card" onClick={() => handleCardClick('CASE #IND-002')} style={{ cursor: 'pointer' }}>
            <div className="case-card-header">
              <span className="case-id">CASE #IND-002</span>
            </div>
            <h3>Mohammed Yusuf v. National Investigation Agency</h3>
            <span className="case-citation">(2022) Supreme Court of India</span>
            <div className="case-tags">
              <span className="tag tag-coral">UAPA</span>
              <span className="tag">BAIL</span>
            </div>
            <p>Prolonged incarceration under UAPA without trial violates Article 21; bail may be granted on constitutional grounds irrespective of statutory restrictions.</p>
            <div className="case-card-footer">
              <span className="view-link">VIEW PRECEDENT</span>
              <span className="citations">UAPA · Speedy Trial</span>
            </div>
          </div>

          <div className="case-card" onClick={() => handleCardClick('CASE #IND-003')} style={{ cursor: 'pointer' }}>
            <div className="case-card-header">
              <span className="case-id">CASE #IND-003</span>
            </div>
            <h3>Ananya Foundation v. Ministry of Environment</h3>
            <span className="case-citation">(2023) Supreme Court of India</span>
            <div className="case-tags">
              <span className="tag tag-pink">ENVIRONMENT</span>
              <span className="tag">CLIMATE</span>
            </div>
            <p>Citizens possess a constitutionally enforceable right to a clean and healthy environment free from the adverse effects of climate change under Article 21.</p>
            <div className="case-card-footer">
              <span className="view-link">VIEW PRECEDENT</span>
              <span className="citations">Public Trust Doctrine</span>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
};

export default Dashboard;
