import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (caseId) => {
    navigate(`/case/${encodeURIComponent(caseId)}`, { state: { caseId } });
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/auth/logout', {
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
        <div className="sidebar-header">
          <div className="logo-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div className="logo-text">
            <h2>Superior<br/>Court</h2>
            <span>REGISTRY OFFICE</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            DASHBOARD
          </a>
          <a className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            CASE LIBRARY
          </a>
          <a className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 13.5V16.5l-4 4-4-4v-3L10 9.5l4 4zM2 14l5-5M22 14l-5-5"></path><circle cx="16" cy="6" r="3"></circle></svg>
            MOOT ARENA
          </a>
          <a className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>
            LEADERBOARD
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
              <a>MOOT ARENA</a>
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
            <button className="btn-outline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              FILTERS
            </button>
            <button className="btn-solid">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              SAVED CASES
            </button>
          </div>
        </div>

        <div className="featured-section">
          <div className="featured-card">
            <div className="featured-image-container">
              <img src="/case_featured.png" alt="Right to Privacy - Puttaswamy" />
              <span className="image-tag">CONSTITUTIONAL</span>
            </div>
            <div className="featured-content">
              <span className="featured-label">SUPREME COURT OF INDIA</span>
              <h2>Justice K.S. Puttaswamy<br/>(Retd.) v. Union of India</h2>
              <span className="case-year">(2017) 10 SCC 1 · Nine-Judge Bench</span>
              <p>The Supreme Court unanimously declared the right to privacy a fundamental right under Article 21 of the Constitution. The judgment overruled M.P. Sharma and Kharak Singh, establishing that privacy is intrinsic to life, liberty, and dignity — and subject to the triple test of legality, necessity, and proportionality.</p>
              <div className="featured-footer">
                <a className="read-more" onClick={() => handleCardClick('CASE #IND-001')}>READ FULL CASE &rarr;</a>
                <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </div>
            </div>
          </div>
          
          <div className="jurisdiction-sidebar">
            <h3>Browse by Court</h3>
            <ul className="jurisdiction-list">
              <li>
                <span>SUPREME COURT OF INDIA</span>
                <span className="count">100</span>
              </li>
              <li>
                <span>HIGH COURTS</span>
                <span className="count">0</span>
              </li>
              <li>
                <span>TRIBUNALS (NGT, NCLT)</span>
                <span className="count">0</span>
              </li>
              <li>
                <span>CONSTITUTION BENCH</span>
                <span className="count">18</span>
              </li>
            </ul>
            <div className="editors-note">
              <h4>EDITOR'S NOTE</h4>
              <p>"The Constitution is not merely a document — it is a living charter that evolves with the aspirations of the people."</p>
            </div>
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
              <svg viewBox="0 0 24 24" fill="transparent" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
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
              <svg viewBox="0 0 24 24" fill="transparent" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
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
              <svg viewBox="0 0 24 24" fill="#000" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
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

        <div className="bottom-modules">
          <div className="historical-archive">
            <img src="/historical_archive.png" alt="Historical Archives" />
            <div className="overlay-box">
              <h3>Constitutional Bench Archives</h3>
              <span className="period">1950 — PRESENT</span>
              <button className="btn-solid-small">ACCESS VAULT</button>
            </div>
          </div>

          <div className="comparative-module">
            <span className="subtitle">DEEP RESEARCH</span>
            <h2>Indian<br/>Jurisprudence Module</h2>
            <p className="description">Our editorial engine allows you to analyse landmark Indian Supreme Court judgments — from the Kesavananda Bharati basic structure doctrine to the Puttaswamy privacy test. Explore how constitutional law has evolved in India's federal judicial system.</p>
            
            <div className="module-buttons">
              <button className="module-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l6 6"></path><path d="M4 4l5 5"></path></svg>
                <span>CROSS-<br/>ANALYSIS</span>
              </button>
              <button className="module-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                <span>CITE-CHECKING</span>
              </button>
              <button className="module-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>DRAFTING AIDS</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fab">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </div>
    </div>
  );
};

export default Dashboard;
