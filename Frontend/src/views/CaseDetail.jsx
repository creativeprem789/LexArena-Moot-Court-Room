import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CaseDetail.css';

// --- Static case data keyed by case ID ---
const CASE_DATA = {
  'CASE #IND-001': {
    docketNumber: '#WP-2019-8821',
    title: 'Sharma v. Union of India',
    citation: '(2019) 14 SCC 285',
    tags: [{ label: 'PRIVACY', color: 'pink' }, { label: 'ARTICLE 21', color: 'gray' }],
    judge: 'Hon. Justice D.Y. Chandrachud',
    dateOfRecord: 'September 11, 2019',
    jurisdiction: 'Supreme Court of India',
    plaintiff: { name: 'Ramesh Sharma', rep: 'Represented by Senior Advocate, Privacy Rights Collective.' },
    defendant: { name: 'Union of India & Others', rep: 'Represented by the Solicitor General of India.' },
    charges: ['Right to Privacy', 'Aadhaar Act, 2016', 'Article 21 — Life & Personal Liberty'],
    legalDescription: `"The matter before this Hon'ble Court arises out of a challenge to the mandatory collection and storage of biometric data by private commercial entities under the Aadhaar framework without specific legislative authorization. The petitioner contends that compelled biometric enrolment by private actors violates the right to privacy upheld in Justice K.S. Puttaswamy (Retd.) v. Union of India (2017). The respondent Union argues that the Aadhaar Act and notifications thereunder provide sufficient legislative backing and serve a legitimate state aim."`,
    citations: 36,
    status: 'AWAITING DOCUMENT SUBMISSION',
  },
  'CASE #IND-002': {
    docketNumber: '#CRL-2022-1145',
    title: 'Mohammed Yusuf v. National Investigation Agency',
    citation: '(2022) 11 SCC 410',
    tags: [{ label: 'UAPA', color: 'coral' }, { label: 'BAIL', color: 'gray' }],
    judge: 'Hon. Justice N.V. Ramana',
    dateOfRecord: 'March 25, 2022',
    jurisdiction: 'Supreme Court of India',
    plaintiff: { name: 'Mohammed Yusuf', rep: 'Represented by Advocate on Record, Liberty Law Chamber.' },
    defendant: { name: 'National Investigation Agency', rep: 'Represented by the Attorney General of India.' },
    charges: ['Unlawful Activities (Prevention) Act — Section 43D(5)', 'Article 21 — Right to Liberty', 'Speedy Trial'],
    legalDescription: `"The petitioner, incarcerated for over four years without completion of trial under the UAPA, challenges the blanket restriction on bail imposed by Section 43D(5) of the Act as violative of Article 21 of the Constitution. The petitioner argues that indefinite pre-trial detention defeats the right to a speedy trial and the constitutional presumption of innocence. The NIA contends that the nature of the alleged offence — terror financing — necessitates stringent bail conditions as provided by Parliament."`,
    citations: 52,
    status: 'AWAITING DOCUMENT SUBMISSION',
  },
  'CASE #IND-003': {
    docketNumber: '#WP-2023-4412',
    title: 'Ananya Foundation v. Ministry of Environment',
    citation: '(2023) 7 SCC 119',
    tags: [{ label: 'ENVIRONMENT', color: 'pink' }, { label: 'CLIMATE', color: 'gray' }],
    judge: 'Hon. Justice Sanjay Kishan Kaul',
    dateOfRecord: 'July 03, 2023',
    jurisdiction: 'Supreme Court of India',
    plaintiff: { name: 'Ananya Environmental Foundation', rep: 'Represented by Senior Advocate, Green Bench Collective.' },
    defendant: { name: 'Ministry of Environment, Forest and Climate Change', rep: 'Represented by the Solicitor General of India.' },
    charges: ['Right to Clean Environment', 'Article 21 — Right to Life', 'Climate Change & Public Trust Doctrine'],
    legalDescription: `"This writ petition arises out of the government's failure to implement enforceable climate adaptation policies as mandated by India's Nationally Determined Contributions under the Paris Agreement. The petitioner argues that the absence of a binding domestic climate legislation exposes citizens — particularly those in climate-vulnerable regions — to foreseeable harm, violating their right to life under Article 21. The Ministry contends that executive climate policy is a matter of governance beyond judicial superintendence."`,
    citations: 28,
    status: 'AWAITING DOCUMENT SUBMISSION',
  },
};

const FALLBACK_CASE = {
  docketNumber: '#WP-2026-7741',
  title: 'In Re: Honble Court suo motu v. Union of India',
  citation: 'Suo Motu Writ Petition (Civil) (2026)',
  tags: [{ label: 'FUNDAMENTAL RIGHTS', color: 'gray' }, { label: 'ARTICLE 21', color: 'gray' }, { label: 'PIL', color: 'coral' }],
  judge: 'Hon. Chief Justice of India',
  dateOfRecord: 'January 15, 2026',
  jurisdiction: 'Supreme Court of India',
  plaintiff: { name: 'The Court (Suo Motu)', rep: 'Court acts on its own motion under Article 32.' },
  defendant: { name: 'Union of India', rep: 'Represented by the Attorney General of India.' },
  charges: ['Fundamental Rights Violation', 'Article 21 — Life & Liberty', 'PIL — Public Interest'],
  legalDescription: `"This Hon'ble Court has taken suo motu cognizance of the alleged systemic failure to protect the constitutional rights of marginalised communities across multiple states. The matter raises questions of whether administrative inaction that forseeably causes harm to life and dignity constitutes a constitutional tort under Article 21, and what supervisory jurisdiction this Court may exercise over the executive to compel compliance with fundamental rights obligations."`,
  citations: 0,
  status: 'AWAITING DOCUMENT SUBMISSION',
};

// --- Utility ---
const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getTimeAgo = (date) => {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
};

// --- Main Component ---
const CaseDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Accept case data passed via router state, or use fallback
  const passedCase = location.state?.caseData || null;
  const caseId = location.state?.caseId || null;
  const caseData = (caseId && CASE_DATA[caseId]) || passedCase || FALLBACK_CASE;

  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | submitting | success
  const [saveDraftStatus, setSaveDraftStatus] = useState('idle');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  const ACCEPTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

  const handleFiles = (files) => {
    const valid = Array.from(files).filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        alert(`"${f.name}" is not a supported file type. Use PDF or DOCX.`);
        return false;
      }
      if (f.size > MAX_SIZE) {
        alert(`"${f.name}" exceeds the 50 MB size limit.`);
        return false;
      }
      return true;
    });

    const newFiles = valid.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      uploadedAt: new Date(),
      type: f.type,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemoveFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = () => {
    if (uploadedFiles.length === 0) return;
    setSubmitStatus('submitting');
    setTimeout(() => {
      navigate('/moot-court', {
        state: {
          caseId,
          caseData,
          uploadedFiles: uploadedFiles.map(f => ({ name: f.name, size: f.size })),
          tags: caseData.tags,
        }
      });
    }, 1200);
  };

  const handleSaveDraft = () => {
    setSaveDraftStatus('saving');
    setTimeout(() => {
      setSaveDraftStatus('saved');
      setTimeout(() => setSaveDraftStatus('idle'), 2000);
    }, 1000);
  };

  const tagColorClass = (color) => {
    if (color === 'pink') return 'tag-pink';
    if (color === 'coral') return 'tag-coral';
    return '';
  };

  return (
    <div className="cd-layout">
      {/* Sidebar Overlay */}
      {isMenuOpen && <div className="cd-sidebar-overlay" onClick={() => setIsMenuOpen(false)} />}

      {/* ── Sidebar ────────────────────────────────── */}
      <aside className={`cd-sidebar ${isMenuOpen ? 'cd-open' : ''}`}>
        <div className="cd-sidebar-close" onClick={() => setIsMenuOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </div>
        <div className="cd-sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
          <div className="cd-logo-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cd-logo-icon">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="cd-logo-text">
            <h2 style={{ whiteSpace: 'nowrap' }}>Lex Arena</h2>
            <span>LEGAL &amp; MOOT</span>
          </div>
        </div>

        <nav className="cd-sidebar-nav">
          <a className="cd-nav-item" onClick={() => navigate('/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            DASHBOARD
          </a>
          <a className="cd-nav-item cd-active" onClick={() => navigate('/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            CASE LIBRARY
          </a>
          <a className="cd-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 13.5V16.5l-4 4-4-4v-3L10 9.5l4 4zM2 14l5-5M22 14l-5-5" />
              <circle cx="16" cy="6" r="3" />
            </svg>
            MOOT ARENA
          </a>
          <a className="cd-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
            </svg>
            LEADERBOARD
          </a>
        </nav>

        <div className="cd-sidebar-bottom">
          <a className="cd-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            SUPPORT
          </a>
        </div>

        {/* Confidential watermark */}
        <div className="cd-watermark">
          <span>CONFIDENTIAL LEGAL RECORD</span>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────── */}
      <main className="cd-main">

        {/* Top nav */}
        <header className="cd-top-nav">
          <div className="cd-top-nav-left">
            <div className="cd-menu-toggle" onClick={() => setIsMenuOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </div>
            <h3 className="cd-brand-title">JUDICIAL EDITORIAL</h3>
            <div className="cd-top-nav-links">
              <a onClick={() => navigate('/dashboard')}>DASHBOARD</a>
              <a className="cd-link-active" onClick={() => navigate('/dashboard')}>CASE LIBRARY</a>
              <a>MOOT ARENA</a>
            </div>
          </div>
          <div className="cd-top-nav-right">
            <span className="cd-status-badge">
              <span className="cd-status-dot" />
              {caseData.status}
            </span>
            <div className="cd-nav-icons">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <div className="cd-avatar" />
            </div>
          </div>
        </header>

        {/* ── Phase Banner ── */}
        <div className="cd-phase-banner">
          <div className="cd-phase-left">
            <button className="cd-back-btn" onClick={() => navigate('/dashboard')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              BACK TO LIBRARY
            </button>
            <span className="cd-phase-title">Courtroom Initialization Phase</span>
          </div>
          <div className="cd-phase-right">
            <span className="cd-phase-tag">DIGITAL JUSTICE SYSTEM</span>
            <span className="cd-phase-version">JUDICIAL EDITORIAL V4.2</span>
          </div>
        </div>

        <div className="cd-content-wrap">

          {/* ── Docket Info Bar ── */}
          <div className="cd-docket-bar">
            <div className="cd-docket-item">
              <span className="cd-docket-label">DOCKET NUMBER</span>
              <span className="cd-docket-value cd-docket-bold">{caseData.docketNumber}</span>
            </div>
            <div className="cd-docket-item">
              <span className="cd-docket-label">PRESIDING JUDGE</span>
              <span className="cd-docket-value">{caseData.judge}</span>
            </div>
            <div className="cd-docket-item">
              <span className="cd-docket-label">DATE OF RECORD</span>
              <span className="cd-docket-value">{caseData.dateOfRecord}</span>
            </div>
            <div className="cd-docket-item">
              <span className="cd-docket-label">JURISDICTION</span>
              <span className="cd-docket-value">{caseData.jurisdiction}</span>
            </div>
            <div className="cd-docket-scales">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v20M5 8l7-5 7 5M3 14l4-6 4 6M13 14l4-6 4 6" />
                <path d="M3 20h18" />
                <path d="M3 14h8M13 14h8" />
              </svg>
            </div>
          </div>

          <div className="cd-main-grid">
            {/* ── Case Overview ── */}
            <section className="cd-section">
            <h2 className="cd-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Case Overview &amp; Proceedings Brief
            </h2>

            <div className="cd-parties">
              <div className="cd-party-card cd-party-plaintiff">
                <span className="cd-party-role">PLAINTIFF</span>
                <p className="cd-party-name">{caseData.plaintiff.name}</p>
                <span className="cd-party-rep">{caseData.plaintiff.rep}</span>
              </div>
              <div className="cd-vs-divider">VS</div>
              <div className="cd-party-card cd-party-defendant">
                <span className="cd-party-role">DEFENDANT</span>
                <p className="cd-party-name">{caseData.defendant.name}</p>
                <span className="cd-party-rep">{caseData.defendant.rep}</span>
              </div>
            </div>

            <div className="cd-summary-block">
              <span className="cd-block-label">SUMMARY OF CHARGES</span>
              <div className="cd-charge-tags">
                {caseData.charges.map((c) => (
                  <span key={c} className="cd-charge-tag">{c}</span>
                ))}
              </div>
            </div>

            <div className="cd-summary-block">
              <span className="cd-block-label">LEGAL DESCRIPTION</span>
              <blockquote className="cd-legal-desc">{caseData.legalDescription}</blockquote>
            </div>

            <div className="cd-summary-block cd-meta-row">
              <div className="cd-meta-item">
                <span className="cd-block-label">CASE ID</span>
                <span className="cd-meta-value">{caseData.docketNumber}</span>
              </div>
              <div className="cd-meta-item">
                <span className="cd-block-label">CITATION</span>
                <span className="cd-meta-value cd-italic">{caseData.citation}</span>
              </div>
              <div className="cd-meta-item">
                <span className="cd-block-label">CITATIONS</span>
                <span className="cd-meta-value">{caseData.citations} references</span>
              </div>
              <div className="cd-meta-item">
                <span className="cd-block-label">AREAS OF LAW</span>
                <div className="cd-tag-row">
                  {caseData.tags.map((t) => (
                    <span key={t.label} className={`cd-tag ${tagColorClass(t.color)}`}>{t.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Document Submission Module ── */}
          {submitStatus !== 'success' ? (
            <section className="cd-section cd-doc-section">
              <h2 className="cd-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                Document Submission Module
              </h2>

              <p className="cd-doc-note">
                Upload all required legal documents to initialize proceedings. All documents must be signed via
                Digital Jurist Keys before finalization.
              </p>

              {/* Drop Zone */}
              <div
                className={`cd-drop-zone ${isDragging ? 'cd-drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="cd-drop-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                </div>
                <p className="cd-drop-title">Required Legal Documents</p>
                <p className="cd-drop-sub">Drag and drop case files or click to browse</p>
                <span className="cd-drop-formats">SUPPORTED FORMATS: .PDF, .DOCX (MAX 50MB PER FILE)</span>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="cd-file-list">
                  <span className="cd-file-list-header">UPLOADED FILES ({uploadedFiles.length})</span>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="cd-file-item">
                      <div className="cd-file-icon">
                        {file.type === 'application/pdf' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        )}
                      </div>
                      <div className="cd-file-info">
                        <span className="cd-file-name">{file.name}</span>
                        <span className="cd-file-meta">
                          {formatBytes(file.size)} &bull; UPLOADED {getTimeAgo(file.uploadedAt).toUpperCase()}
                        </span>
                      </div>
                      <button
                        className="cd-file-remove"
                        onClick={() => handleRemoveFile(file.id)}
                        title="Remove file"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action bar */}
              <div className="cd-action-bar">
                <button className="cd-save-btn" onClick={handleSaveDraft}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  {saveDraftStatus === 'saving' ? 'SAVING...' : saveDraftStatus === 'saved' ? '✓ DRAFT SAVED' : 'SAVE DRAFT & EXIT'}
                </button>

                <div className="cd-submit-right">
                  <span className="cd-submit-note" style={{ color: uploadedFiles.length === 0 ? 'var(--cd-text-gray)' : 'inherit' }}>
                    {uploadedFiles.length === 0 
                      ? <>DOCUMENT RECORD INCOMPLETE<br />UPLOAD AT LEAST 1 DOCUMENT<br />TO PROCEED.</>
                      : <>ALL DOCUMENTS MUST BE SIGNED<br />VIA DIGITAL JURIST KEYS BEFORE<br />INITIALIZATION.</>}
                  </span>
                  <button
                    className={`cd-submit-btn ${submitStatus === 'submitting' ? 'cd-submitting' : ''} ${uploadedFiles.length === 0 ? 'cd-submit-disabled' : ''}`}
                    onClick={handleSubmit}
                    disabled={submitStatus === 'submitting' || uploadedFiles.length === 0}
                  >
                    {submitStatus === 'submitting' ? (
                      <>
                        <span className="cd-spinner" /> INITIALIZING...
                      </>
                    ) : (
                      <>
                        SUBMIT DOCUMENTS &amp; INITIALIZE PROCEEDINGS
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          ) : (
            /* ── Success State ── */
            <section className="cd-section cd-success-section">
              <div className="cd-success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="cd-success-title">Proceedings Initialized</h2>
              <p className="cd-success-sub">
                Your documents have been submitted successfully. The case <strong>{caseData.title}</strong> has been
                queued for courtroom initialization. You will receive a confirmation via the Digital Jurist system.
              </p>
              <div className="cd-success-meta">
                <span>DOCKET: {caseData.docketNumber}</span>
                <span>DOCUMENTS SUBMITTED: {uploadedFiles.length}</span>
                <span>TIMESTAMP: {new Date().toLocaleString()}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--cd-text-gray)', margin: 0 }}>Redirecting to courtroom…</p>
              <button className="cd-back-dashboard-btn" onClick={() => navigate('/moot-court', { state: { caseId, caseData, tags: caseData.tags } })}>
                ENTER COURTROOM NOW →
              </button>
            </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseDetail;
