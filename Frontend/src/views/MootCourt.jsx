import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './MootCourt.css';

const API_BASE = 'http://localhost:5000/api/courtroom';

/* ─────────────────────────────────────────────────────────────
   CASE SCRIPTS (Static Fallback/Metadata)
───────────────────────────────────────────────────────────────*/
const CASE_SCRIPTS = {
  'CASE #IND-001': {
    title: 'Sharma v. Union of India',
    judge: 'Justice D.Y. Chandrachud',
    prosecution: 'Additional Solicitor General R. Mehta',
    defense: 'Senior Advocate A. Divan',
    topic: 'Right to Privacy & Aadhaar Biometrics',
    precedents: [
      'Justice K.S. Puttaswamy (Retd.) v. Union of India (2017)',
      'K.S. Puttaswamy v. Union of India — Aadhaar (2018)',
      'Maneka Gandhi v. Union of India (1978)',
    ],
    analystHint: '"Justice Chandrachud authored the landmark privacy judgment. Frame your arguments around the triple test: legality, necessity, and proportionality. The State will invoke national security and welfare delivery."',
  },
  'CASE #IND-002': {
    title: 'Mohammed Yusuf v. National Investigation Agency',
    judge: 'Justice N.V. Ramana',
    prosecution: 'Attorney General K.K. Venugopal',
    defense: 'Senior Advocate Dushyant Dave',
    topic: 'UAPA Bail & Right to Speedy Trial',
    precedents: [
      'Union of India v. K.A. Najeeb (2021)',
      'Nikesh Tarachand Shah v. Union of India (2018)',
      'Hussainara Khatoon v. State of Bihar (1979)',
    ],
    analystHint: '"Justice Ramana has consistently held that bail is the rule and jail the exception. Emphasise the constitutional invalidity of indefinite pre-trial detention. Counter the NIA\'s terror-financing narrative with proportionality doctrine."',
  },
  'CASE #IND-003': {
    title: 'Ananya Foundation v. Ministry of Environment',
    judge: 'Justice Sanjay Kishan Kaul',
    prosecution: 'Solicitor General T. Mehta',
    defense: 'Senior Advocate M.G. Ramachandran',
    topic: 'Right to Clean Environment & Climate Litigation',
    precedents: [
      'M.C. Mehta v. Union of India (1987)',
      'Vellore Citizens Welfare Forum v. Union of India (1996)',
      'T.N. Godavarman Thirumulpad v. Union of India (1995)',
    ],
    analystHint: '"Justice Kaul is receptive to environmental PILs grounded in the public trust doctrine and Article 21. Cite M.C. Mehta extensively. Show a causal link between regulatory inaction and harm to identifiable communities."',
  },
};

const FALLBACK_SCRIPT = CASE_SCRIPTS['CASE #IND-001'];

/* ─────────────────────────────────────────────────────────────
   SPEECH BUBBLE — appears near avatar
───────────────────────────────────────────────────────────────*/
const SpeechBubble = ({ speech, side, key: animKey }) => {
  if (!speech) return null;
  return (
    <div
      className={`mc-speech-bubble mc-speech-${side}${speech.isQuestion ? ' mc-speech-question' : ''}${speech.isInterruption ? ' mc-speech-interruption' : ''}`}
      key={animKey}
    >
      {speech.isQuestion && !speech.isInterruption && (
        <span className="mc-speech-tag">PROCEDURAL QUESTION</span>
      )}
      {speech.isInterruption && (
        <span className="mc-speech-tag mc-tag-interruption">JUDICIAL INTERRUPTION</span>
      )}
      <p>{speech.text}</p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   TYPING BUBBLE
───────────────────────────────────────────────────────────────*/
const TypingBubble = ({ side }) => (
  <div className={`mc-speech-bubble mc-speech-${side} mc-speech-typing`}>
    <div className="mc-typing-dots">
      <span /><span /><span />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   AVATAR FIGURE
───────────────────────────────────────────────────────────────*/
const AvatarFigure = ({ initials, label, role, active, badgeColor }) => (
  <div className={`mc-figure mc-figure-${role} ${active ? 'mc-figure-active' : ''}`}>
    <div className={`mc-figure-avatar mc-avatar-${badgeColor}`}>
      <span>{initials}</span>
      {active && <div className="mc-figure-speaking-ring" />}
    </div>
    <div className={`mc-figure-badge mc-badge-${badgeColor}`}>{label}</div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────*/
const MootCourt = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const caseId = location.state?.caseId || 'CASE #IND-001';
  const script = CASE_SCRIPTS[caseId] || FALLBACK_SCRIPT;

  // ── Per-avatar speech state ──────────────
  const [judgeSpeech,      setJudgeSpeech]      = useState(null); 
  const [prosecutionSpeech,setProsecutionSpeech] = useState(null); 
  const [defenseSpeech,    setDefenseSpeech]     = useState(null); 
  const [userSpeech,       setUserSpeech]        = useState(null); 

  // ── Session state ────────────────────────
  const [phase,           setPhase]           = useState('intro');
  const [typing,          setTyping]          = useState(null); 
  const [activeAvatar,    setActiveAvatar]    = useState(null);
  const [argStrength,     setArgStrength]     = useState(45);
  const [roundIndex,      setRoundIndex]      = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [exhibitsCount,   setExhibitsCount]   = useState(0);
  const [analystNote,     setAnalystNote]     = useState(script.analystHint);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [userSubmitCount, setUserSubmitCount] = useState(0);
  const [rebuttal,        setRebuttal]        = useState('');
  const [showVerdictModal,setShowVerdictModal]= useState(false);
  const [violationCount,  setViolationCount]  = useState(0);
  
  // ── AI/RAG History state ─────────────────
  const [history,         setHistory]         = useState([]);
  const [citedCases,      setCitedCases]      = useState(script.precedents);
  const [defenseCases,    setDefenseCases]    = useState([]);
  const [finalVerdict,    setFinalVerdict]    = useState(null);

  const timerRef = useRef(null);
  const bubbleKey = useRef(0);

  const nextKey = () => { bubbleKey.current += 1; return bubbleKey.current; };

  useEffect(() => {
    timerRef.current = setInterval(() => setSessionDuration(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatDuration = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const strengthColor =
    argStrength >= 70 ? '#16a34a' : argStrength >= 45 ? '#c8900a' : '#dc2626';

  const speak = (role, text, extra = {}, typingMs = 1400) =>
    new Promise(resolve => {
      setTyping(role);
      setActiveAvatar(role);
      setTimeout(() => {
        setTyping(null);
        const payload = { text, key: nextKey(), ...extra };
        if (role === 'judge')       setJudgeSpeech(payload);
        if (role === 'prosecution') setProsecutionSpeech(payload);
        if (role === 'defense')     setDefenseSpeech(payload);
        resolve();
      }, typingMs);
    });

  /* ── Start session (Live AI) ── */
  const startSession = async () => {
    setPhase('live');
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/start`, { caseId, caseData: script });
      const { judge, prosecution, defense } = res.data;

      await speak('judge',       judge,       {}, 1000);
      await speak('prosecution', prosecution, {}, 1500);
      await speak('defense',     defense,     {}, 1500);
      
      setHistory(prev => [...prev, 
        { role: 'prosecution', text: prosecution },
        { role: 'defense', text: defense }
      ]);
      setExhibitsCount(1);
    } catch (err) {
      console.error("API Error:", err);
      // Fallback in case of API failure
      await speak('judge', "Court is session. We are here to deliberate.", {}, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Submit Rebuttal (RAG + AI) ── */
  const handleSubmitRebuttal = async () => {
    if (!rebuttal.trim() || isSubmitting) return;
    const userText = rebuttal;
    setRebuttal('');
    setIsSubmitting(true);

    setDefenseSpeech({ text: userText, key: nextKey() });
    setActiveAvatar('defense');

    try {
      const res = await axios.post(`${API_BASE}/argue`, { 
        caseId, 
        userArg: userText, 
        history,
        caseMeta: { topic: script.topic },
      });

      const { 
        prosecution, 
        judge, 
        score, 
        scoreNote, 
        retrievedPrecedents, 
        defenseRetrievedPrecedents,
        loopholeDetected,
        judgeInterruption,
        isViolation
      } = res.data;

      // Update analytics
      setArgStrength(score);
      setAnalystNote(scoreNote);

      let currentViolations = violationCount;
      if (isViolation) {
        currentViolations += 1;
        setViolationCount(currentViolations);
      }

      if (currentViolations > 2) {
        setFinalVerdict({
           ruling: "SESSION TERMINATED: Repeated Contempt of Court.\nThe court has found the petitioner's counsel in repeated, willful contempt due to unprofessional, off-topic, or abusive conduct. This behavior is unacceptable in the Supreme Court of India.",
           outcome: "LOSS",
           reasoning: "The session was terminated prematurely after 3 serious violations.",
           strengths: "None.",
           weaknesses: "Counsel repeatedly failed to adhere to professional courtroom standards despite multiple judicial warnings.",
           metrics: {
             proceduralFinesse: 0,
             precedentApplication: 0,
             responsivenessScore: 0,
             logicalStructureScore: 0
           },
           benchAdvice: "Return to the Case Library and review the basics of courtroom etiquette and procedural relevance before attempting another moot session."
        });
        setPhase('terminated');
        setShowVerdictModal(true);
        return;
      }

      if (retrievedPrecedents) {
        const uniquePrecedents = Array.from(new Set([...citedCases, ...retrievedPrecedents.map(p => p.title)]));
        setCitedCases(uniquePrecedents);
      }
      if (defenseRetrievedPrecedents) {
        setDefenseCases(defenseRetrievedPrecedents.map(p => p.title));
      }

      // Update history
      setHistory(prev => [...prev, 
        { role: 'user', text: userText },
        { role: 'prosecution', text: prosecution },
        { role: 'judge', text: judge }
      ]);

      // Sequence responses
      if (loopholeDetected && judgeInterruption) {
        // Judge interrupts IMMEDIATELY if loophole detected
        await speak('judge', judgeInterruption, { isInterruption: true }, 1500);
        await speak('prosecution', prosecution, {}, 1200);
      } else {
        await speak('prosecution', prosecution, {}, 1200);
      }
      
      setDefenseSpeech(null); // hide user bubble when judge starts
      await speak('judge', judge, { isQuestion: true }, 1800);

      setUserSubmitCount(c => c + 1);
      setRoundIndex(r => r + 1);
      setExhibitsCount(c => c + 1);

      // Trigger verdict after 5 rounds
      if (roundIndex >= 4) {
        handleEndSession();
      }

    } catch (err) {
      console.error("API Error during argument:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSession = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/verdict`, { 
        caseId, 
        argHistory: history,
        finalScore: argStrength 
      });
      setFinalVerdict(res.data);
      setShowVerdictModal(true);
    } catch (err) {
      console.error("Verdict Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mc-layout">

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className="mc-sidebar">
        <div className="mc-sidebar-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="mc-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="mc-brand-name">Lex Arena</p>
            <p className="mc-brand-sub">Legal &amp; Moot</p>
          </div>
        </div>

        <nav className="mc-sidebar-nav">
          <a className="mc-nav-item" onClick={() => navigate('/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </a>
          <a className="mc-nav-item" onClick={() => navigate('/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            Case Library
          </a>
          <a className="mc-nav-item mc-nav-active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 13.5V16.5l-4 4-4-4v-3L10 9.5l4 4zM2 14l5-5M22 14l-5-5"/><circle cx="16" cy="6" r="3"/>
            </svg>
            Moot Arena
          </a>
          <a className="mc-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2z"/>
            </svg>
            Leaderboard
          </a>
        </nav>

        <div className="mc-sidebar-bottom">
          <a className="mc-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </a>
          <a className="mc-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Support
          </a>
          {phase === 'intro' ? (
            <button className="mc-start-btn" onClick={startSession}>Start Simulation</button>
          ) : (
            <button className="mc-start-btn mc-end-btn" onClick={handleEndSession}>End Session</button>
          )}
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <main className="mc-main">
        {/* Top Bar */}
        <header className="mc-topbar">
          <div className="mc-topbar-left">
            <span className="mc-session-label">SESSION:</span>
            <span className="mc-session-title">{script.title}</span>
            <span className="mc-session-topic">{script.topic}</span>
          </div>
          <div className="mc-topbar-right">
            <div className="mc-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input placeholder="Search precedents…" />
            </div>
            <div className="mc-user-avatar"><span>U</span></div>
          </div>
        </header>

        {/* Court Body */}
        <div className="mc-court-body">

          {/* LEFT PANEL */}
          <aside className="mc-left-panel">


            <div className="mc-analyst-card">
              <div className="mc-analyst-header">
                <div className="mc-analyst-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                  </svg>
                </div>
                <span className="mc-analyst-title">LEGAL ANALYST</span>
              </div>
              <p className="mc-analyst-note">{analystNote}</p>
            </div>

            <div className="mc-phase-card">
              <span className="mc-panel-label">SESSION PHASE</span>
              <span className="mc-phase-val">{phase === 'intro' ? 'Pre-Session' : `Round ${roundIndex + 1} — Active`}</span>
              <div className={`mc-live-dot ${phase === 'live' ? 'mc-live-on' : ''}`} />
            </div>
          </aside>

          {/* CENTER — COURTROOM STAGE */}
          <section className="mc-center">

            {/* INTRO SPLASH */}
            {phase === 'intro' && (
              <div className="mc-intro-splash">
                <div className="mc-intro-gavel">⚖️</div>
                <h2>Courtroom is Ready</h2>
                <p>Case <strong>{script.title}</strong> has been initialized.<br />Press <strong>Start Simulation</strong> to begin proceedings.</p>
                <div className="mc-intro-participants">
                  <div className="mc-intro-part"><span className="mc-intro-role">JUDGE</span><span>{script.judge}</span></div>
                  <div className="mc-intro-part"><span className="mc-intro-role">PROSECUTION</span><span>{script.prosecution}</span></div>
                  <div className="mc-intro-part"><span className="mc-intro-role">DEFENSE</span><span>{script.defense}</span></div>
                </div>
                <button className="mc-intro-btn" onClick={startSession}>▶ Initialize Session</button>
              </div>
            )}

            {/* LIVE COURTROOM */}
            {phase === 'live' && (
              <div className="mc-stage">

                {/* ── JUDGE ROW (top center) ── */}
                <div className="mc-stage-judge-row">
                  {/* Speech bubble above judge */}
                  <div className="mc-stage-judge-bubble-area">
                    {typing === 'judge' ? (
                      <TypingBubble side="judge" />
                    ) : judgeSpeech ? (
                      <SpeechBubble side="judge" speech={judgeSpeech} key={judgeSpeech.key} />
                    ) : null}
                  </div>
                  {/* Judge avatar */}
                  <AvatarFigure
                    initials="JR"
                    label={script.judge}
                    role="judge"
                    active={activeAvatar === 'judge' || typing === 'judge'}
                    badgeColor="dark"
                  />
                </div>

                {/* ── COUNSELS ROW (bottom) ── */}
                <div className="mc-stage-counsels-row">

                  {/* Prosecution: avatar left, bubble right */}
                  <div className="mc-stage-counsel mc-stage-prosecution">
                    <AvatarFigure
                      initials="PX"
                      label={script.prosecution}
                      role="prosecution"
                      active={activeAvatar === 'prosecution' || typing === 'prosecution'}
                      badgeColor="red"
                    />
                    <div className="mc-stage-counsel-bubble">
                      {typing === 'prosecution' ? (
                        <TypingBubble side="prosecution" />
                      ) : prosecutionSpeech ? (
                        <SpeechBubble side="prosecution" speech={prosecutionSpeech} key={prosecutionSpeech.key} />
                      ) : null}
                    </div>
                  </div>

                  {/* Podium divider */}
                  <div className="mc-stage-divider">
                    <div className="mc-podium-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3v18M5 8l7-5 7 5M3 21h18"/>
                        <path d="M3 14l4-5 4 5M13 14l4-5 4 5"/>
                      </svg>
                    </div>
                    <span>VS</span>
                  </div>

                  {/* Defense: bubble left, avatar right */}
                  <div className="mc-stage-counsel mc-stage-defense">
                    <div className="mc-stage-counsel-bubble">
                      {typing === 'defense' ? (
                        <TypingBubble side="defense" />
                      ) : defenseSpeech ? (
                        <SpeechBubble side="defense" speech={defenseSpeech} key={defenseSpeech.key} />
                      ) : null}
                    </div>
                    <AvatarFigure
                      initials="DC"
                      label={script.defense}
                      role="defense"
                      active={activeAvatar === 'defense' || typing === 'defense'}
                      badgeColor="blue"
                    />
                  </div>
                </div>

                {/* ── USER SPEECH (appears when user submits) ── */}
                {userSpeech && (
                  <div className="mc-stage-user-speech">
                    <div className="mc-speech-bubble mc-speech-user" key={userSpeech.key}>
                      <span className="mc-speech-tag mc-speech-tag-user">YOUR ARGUMENT</span>
                      <p>{userSpeech.text}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── REBUTTAL INPUT ── */}
            {phase === 'live' && (
              <div className="mc-rebuttal-wrap">
                <div className="mc-rebuttal-label">YOUR REBUTTAL</div>
                <div className="mc-rebuttal-box">
                  <textarea
                    className="mc-rebuttal-input"
                    placeholder="Enter your legal argument here…"
                    value={rebuttal}
                    onChange={e => setRebuttal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmitRebuttal(); }}
                    disabled={isSubmitting}
                    rows={2}
                  />
                  <div className="mc-rebuttal-actions">
                    <div className="mc-rebuttal-icons">
                      <button className="mc-icon-btn" title="Voice input">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                      </button>
                      <button className="mc-icon-btn" title="Attach exhibit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                      </button>
                    </div>
                    <button
                      className={`mc-submit-btn ${isSubmitting ? 'mc-submitting' : ''} ${!rebuttal.trim() ? 'mc-disabled' : ''}`}
                      onClick={handleSubmitRebuttal}
                      disabled={isSubmitting || !rebuttal.trim()}
                    >
                      {isSubmitting ? <><span className="mc-spinner" />PROCESSING…</> : <>SUBMIT ARGUMENT ▶</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT PANEL */}
          <aside className="mc-right-panel">
            <div className="mc-precedents-card">
              <span className="mc-panel-label">PROSECUTION PRECEDENTS</span>
              <ul className="mc-precedents-list">
                {citedCases.map((p, i) => (
                  <li key={i} className="mc-precedent-item mc-precedent-prosecution">
                    <span className="mc-precedent-dot mc-dot-red" />{p}
                  </li>
                ))}
              </ul>
            </div>

            {defenseCases.length > 0 && (
              <div className="mc-precedents-card">
                <span className="mc-panel-label">DEFENSE PRECEDENTS</span>
                <ul className="mc-precedents-list">
                  {defenseCases.map((p, i) => (
                    <li key={i} className="mc-precedent-item mc-precedent-defense">
                      <span className="mc-precedent-dot mc-dot-blue" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mc-session-log-card">
              <span className="mc-panel-label">SESSION LOG</span>
              <div className="mc-log-row"><span>Duration</span><span className="mc-log-val">{formatDuration(sessionDuration)}</span></div>
              <div className="mc-log-row"><span>Exhibits</span><span className="mc-log-val">{exhibitsCount} Filed</span></div>
              <div className="mc-log-row"><span>Arguments</span><span className="mc-log-val">{userSubmitCount} Submitted</span></div>
              <div className="mc-log-row"><span>Round</span><span className="mc-log-val">{roundIndex} / 5</span></div>
            </div>

            <div className="mc-case-info-card">
              <span className="mc-panel-label">CASE INFO</span>
              <p className="mc-case-info-title">{script.title}</p>
              <p className="mc-case-info-sub">{script.judge} presiding</p>
              <div className="mc-case-info-tags">
                <span className="mc-case-tag">ACTIVE SESSION</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* VERDICT MODAL */}
      {showVerdictModal && (
        <div className="mc-verdict-overlay" onClick={() => setShowVerdictModal(false)}>
          <div className="mc-verdict-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-verdict-gavel">⚖️</div>
            <h2 className="mc-verdict-title">Session Complete</h2>
            <p className="mc-verdict-sub">
              The court has deliberated. Based on the arguments presented in <strong>{script.title}</strong>:
            </p>
            <div className="mc-verdict-score-wrap">
              <div className="mc-verdict-score" style={{ color: strengthColor }}>{argStrength}%</div>
              <p className="mc-verdict-score-label">Final Argument Strength</p>
            </div>
            <div className="mc-verdict-ruling">
              {finalVerdict ? (
                <>
                  <p className={`mc-verdict-outcome ${finalVerdict.outcome === 'WIN' ? 'mc-verdict-win' : finalVerdict.outcome === 'LOSS' ? 'mc-verdict-loss' : 'mc-verdict-neutral'}`}>
                    <strong>{finalVerdict.ruling}</strong><br/>
                    {finalVerdict.reasoning}
                  </p>
                  {finalVerdict.strengths && (
                    <div className="mc-verdict-breakdown">
                      <div className="mc-verdict-strength">
                        <span className="mc-verdict-bk-label">✓ CONSTITUTIONAL STRENGTHS</span>
                        <p>{finalVerdict.strengths}</p>
                      </div>
                      <div className="mc-verdict-weakness">
                        <span className="mc-verdict-bk-label">✗ PROCEDURAL WEAKNESSES</span>
                        <p>{finalVerdict.weaknesses}</p>
                      </div>
                    </div>
                  )}

                  {finalVerdict.metrics && (
                    <div className="mc-verdict-metrics-grid">
                      <div className="mc-metric-item">
                        <span className="mc-metric-label">Procedural Finesse</span>
                        <div className="mc-metric-val-wrap">
                          <div className="mc-metric-bar"><div className="mc-metric-fill" style={{width: `${finalVerdict.metrics.proceduralFinesse}%`}} /></div>
                          <span className="mc-metric-num">{finalVerdict.metrics.proceduralFinesse}%</span>
                        </div>
                      </div>
                      <div className="mc-metric-item">
                        <span className="mc-metric-label">Precedent Application</span>
                        <div className="mc-metric-val-wrap">
                          <div className="mc-metric-bar"><div className="mc-metric-fill" style={{width: `${finalVerdict.metrics.precedentApplication}%`}} /></div>
                          <span className="mc-metric-num">{finalVerdict.metrics.precedentApplication}%</span>
                        </div>
                      </div>
                      <div className="mc-metric-item">
                        <span className="mc-metric-label">Bench Responsiveness</span>
                        <div className="mc-metric-val-wrap">
                          <div className="mc-metric-bar"><div className="mc-metric-fill" style={{width: `${finalVerdict.metrics.responsivenessScore}%`}} /></div>
                          <span className="mc-metric-num">{finalVerdict.metrics.responsivenessScore}%</span>
                        </div>
                      </div>
                      <div className="mc-metric-item">
                        <span className="mc-metric-label">Logical Structure</span>
                        <div className="mc-metric-val-wrap">
                          <div className="mc-metric-bar"><div className="mc-metric-fill" style={{width: `${finalVerdict.metrics.logicalStructureScore}%`}} /></div>
                          <span className="mc-metric-num">{finalVerdict.metrics.logicalStructureScore}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {finalVerdict.benchAdvice && (
                    <div className="mc-verdict-advice">
                      <span className="mc-verdict-bk-label">⚖️ BENCH ADVICE</span>
                      <p>{finalVerdict.benchAdvice}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="mc-verdict-outcome mc-verdict-neutral">Calculating final ruling...</p>
              )}
            </div>
            <div className="mc-verdict-stats">
              <div><span>Duration</span><strong>{formatDuration(sessionDuration)}</strong></div>
              <div><span>Arguments</span><strong>{userSubmitCount}</strong></div>
              <div><span>Exhibits</span><strong>{exhibitsCount}</strong></div>
            </div>
            <div className="mc-verdict-actions">
              <button className="mc-verdict-retry" onClick={() => window.location.reload()}>
                RETRY SESSION
              </button>
              <button className="mc-verdict-exit" onClick={() => navigate('/dashboard')}>
                RETURN TO LIBRARY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MootCourt;
