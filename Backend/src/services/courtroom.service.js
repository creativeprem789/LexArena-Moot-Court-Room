/**
 * Courtroom Service
 * -----------------
 * Orchestrates all AI-generated courtroom content via Google Gemini.
 * Each function uses role-specific RAG context retrieved from the
 * enhanced rag.service.js.
 *
 * Roles
 *   • Judge       — Procedural, Socratic, neutral
 *   • Prosecution — adversarial, anchored in govt-win precedents (RAG)
 *   • Defense     — opening statements only (user IS the defense)
 *   • Scoring     — evaluates user argument quality 0-100
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const ragService = require('./rag.service');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ─── Shared helper ────────────────────────────────────────────────────────────

/**
 * Call Gemini and extract the first JSON object from the response.
 * If parsing fails, returns the fallback object.
 */
async function callGemini(prompt, fallback = {}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // 1. Detect and strip markdown code blocks if the model wrapped the JSON in one.
    // e.g., ```json { ... } ``` or ``` { ... } ```
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      text = markdownMatch[1];
    }

    // 2. Extract the first valid JSON object using balanced brace matching logic or a greedy match.
    // The previous greedy match was fine, but we'll trim first to reduce noise.
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) throw new Error('No JSON block found in response');

    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('[Gemini] Parse error:', err.message);
    // If the error was specifically JSON parsing, log the text that failed to help debug.
    if (err instanceof SyntaxError) {
      console.log('[Gemini] Raw text that failed parse:', text);
    }
    return fallback;
  }
}

// ─── 1. Opening Statements ────────────────────────────────────────────────────

/**
 * Generates opening statements for all three courtroom roles.
 * Uses RAG to ground the prosecutor's opening in real precedents.
 *
 * @param {string} caseId
 * @param {Object} caseData  { title, topic, precedents[], prosecution, defense, judge }
 */
async function generateOpening(caseId, caseData) {
  // Retrieve precedents relevant to the case topic for the opening
  const openingCases = ragService.retrieveForOpening(caseData, 3);
  const openingCtx = ragService.formatContextBlock(openingCases, 'opening');
  const openingCites = ragService.formatCitationInline(openingCases);

  const prompt = `
You are an AI Moot Court System simulating a proceeding before the Supreme Court of India.
Generate realistic and legally grounded opening statements using Indian constitutional law.

=== CASE INFORMATION ===
Title: ${caseData.title}
Legal Topic: ${caseData.topic}
Case ID: ${caseId}
Court: Supreme Court of India

=== RAG RETRIEVED PRECEDENTS (use these to anchor your statements) ===
${openingCtx}

=== KNOWN PRECEDENTS IN THIS CASE ===
${(caseData.precedents || []).join(', ')}

=== INSTRUCTIONS ===
Generate opening statements for a Supreme Court of India proceeding:
- JUDGE: A formal opening remark by a Supreme Court Justice calling the court to order. Use Indian judicial language ("This Hon'ble Court", "the writ petition", "constitutional bench"). Reference the case title and topic. (2-3 sentences)
- PROSECUTION (State/Respondent): A compelling adversarial opening statement representing the Union of India or State. Cite at least ONE specific Indian Supreme Court case from the RAG precedents using the exact case name. Reference relevant constitutional articles (e.g. Article 21, Article 14, Article 19). Be direct and forceful. (3-4 sentences)
- DEFENSE (Petitioner's Counsel): A composed counter-opening. Acknowledge the state's framing and signal the petitioner's legal theory based on fundamental rights. The user will take over as defense counsel. (2-3 sentences)

Return ONLY a valid JSON object:
{
  "judge": "...",
  "prosecution": "...",
  "defense": "...",
  "ragCasesUsed": ["case name 1", "case name 2"]
}
`.trim();

  const fallback = {
    judge: `Court is now in session. We are here to deliberate on ${caseData.title}. All parties, please be seated.`,
    prosecution: `Your Honor, the state intends to demonstrate that the defendant's actions directly contravene established legal principles. We will rely on precedent set in ${openingCites || 'established case law'} to show this beyond doubt.`,
    defense: `Your Honor, the defense respectfully submits that the prosecution's characterization is legally flawed. We will demonstrate that the facts, properly understood under current doctrine, favor our client entirely.`,
    ragCasesUsed: openingCases.map(c => c.title),
  };

  return await callGemini(prompt, fallback);
}

// ─── 2. Argument Round (Core Feature) ────────────────────────────────────────

/**
 * Processes a user (defense) argument and returns:
 *   • Prosecution rebuttal  — RAG-grounded, adversarial
 *   • Judge question        — Socratic, procedural
 *   • Argument score        — 0-100 with coaching note
 *   • Retrieved precedents  — visible to frontend
 *
 * @param {string}   caseId
 * @param {string}   userArg    - The user's defense argument text
 * @param {Array}    history    - Full exchange history [{role, text}]
 * @param {Object}   [caseMeta] - Optional { topic } from CASE_SCRIPTS
 */
async function processArgument(caseId, userArg, history, caseMeta = {}) {
  const topicHint = caseMeta.topic || '';

  // ── Dual RAG retrieval ──
  // Prosecution gets adversarial cases (govt/state wins relevant to this topic)
  const prosecutionCases = ragService.retrieveForProsecution(userArg, topicHint, 4);
  const prosecutionCtx = ragService.formatContextBlock(prosecutionCases, 'prosecution');
  const prosecutionCites = ragService.formatCitationInline(prosecutionCases);

  // Defence-side cases (to help the judge ask pointed follow-up questions)
  const defenseCases = ragService.retrieveForDefense(userArg, topicHint, 2);
  const defenseCtx = ragService.formatContextBlock(defenseCases, 'defense');

  // ── Compose exchange history (last 18 turns max to stay within reasonable tokens) ──
  const recentHistory = history.slice(-18);
  const historyText = recentHistory
    .map(h => `[${h.role.toUpperCase()}]: ${h.text}`)
    .join('\n');

  const prompt = `
You are a legal AI system simulating a professional Moot Courtroom before the Supreme Court of India.
All arguments, precedents, and doctrines should be grounded in Indian constitutional law.

=== CASE ===
Case ID: ${caseId}
Court: Supreme Court of India
Legal Topic: ${topicHint || 'Indian Constitutional Law'}

=== EXCHANGE HISTORY (last ${recentHistory.length} turns) ===
${historyText || '(No prior arguments)'}

=== DEFENSE COUNSEL'S CURRENT ARGUMENT ===
"${userArg}"

=== STATE/RESPONDENT'S RAG RETRIEVED PRECEDENTS ===
These Supreme Court of India judgments support the state's position. The prosecution MUST cite at least 2 by name.
${prosecutionCtx}

=== PETITIONER'S REFERENCE PRECEDENTS ===
These are relevant Indian SC cases the judge is aware of for Socratic questioning.
${defenseCtx}

=== YOUR TASKS ===

CRITICAL INSTRUCTION FOR REALISM: 
DO NOT repeat points, arguments, or questions that already exist in the "EXCHANGE HISTORY". You must actively advance the legal discourse. If a precedent or argument was already used, introduce a new nuance, legal test, or factual distinction.

1. STATE/RESPONDENT'S REBUTTAL (Advocate Persona)
   - Role: Advocate for the State/Union of India. Be **aggressive**, **forceful**, and **skeptical**.
   - Directly refute the specific new claims in the petitioner's latest argument. Do NOT use generic filler.
   - Cite at least 1 new Indian SC case from the "RAG RETRIEVED PRECEDENTS" that hasn't been overused.
   - Reference Articles 21, 14, 19 in specific relation to the State's right to regulate, adding new dimensions (e.g. administrative necessity, public order).

2. JUDICIAL QUERY & INTERRUPTION (Judge Persona)
   - Role: Supreme Court Justice. Be **impartial**, **analytical**, and **pointed**.
   - If the petitioner has a loophole (ignoring a fact, misciting law), MUST interrupt with a sharp challenge.
   - The Judge MUST ask a completely new, distinct question each round. Never repeat "how do you reconcile... with basic structure" if it was already asked. Push the user on specific doctrines (e.g. pith and substance, proportionality test, double-jeopardy).
   - Evolve the line of questioning Socratic-style based exactly on the user's latest input.

3. ARGUMENT SCORE & LOOPHOLE DETECTION
   - Detect if there are significant "loopholes" (logical gaps, factual errors, or failure to address prosecution's points).
   - Score the argument (0-100) on: (a) Constitutional grounding, (b) Factual precision, (c) Precedent use, (d) Logical clarity.

4. BEHAVIOR & RELEVANCE CHECK (CRITICAL)
   - If the DEFENSE COUNSEL'S CURRENT ARGUMENT contains gibberish, is completely off-topic, or contains abusive/unprofessional language:
     - The Judge MUST issue a severe warning for 'Contempt of Court' or unprofessional conduct.
     - The Prosecution should briefly condemn the opposing counsel's conduct.
     - The score MUST be 0, and the scoreNote MUST reflect the penalty for unprofessional conduct or irrelevance.
     - Set "isViolation" to true. Otherwise, set it to false.

Return ONLY a valid JSON object:
{
  "prosecution": "...",
  "judge": "...",
  "loopholeDetected": boolean,
  "judgeInterruption": "...", 
  "score": <number 0-100>,
  "scoreNote": "...",
  "citedCases": ["case name 1", "case name 2"],
  "isViolation": boolean
}
`.trim();

  const fallback = {
    prosecution: `The State's position remains firm. As established in ${prosecutionCites || 'established precedent'}, the argument advanced by the petitioner requires more rigorous constitutional anchoring.`,
    judge: `Counsel, how do you reconcile your position with the principles of proportionality and the doctrine of basic structure as interpreted by this Hon'ble Court?`,
    score: 45,
    scoreNote: '[System Notice]: The court is assessing your previous argument. Please ensure you cite specific Supreme Court precedents (e.g., "Kesavananda Bharati") to strengthen your position.',
    citedCases: prosecutionCases.slice(0, 2).map(c => c.title),
    isViolation: false,
  };

  const aiResponse = await callGemini(prompt, fallback);

  return {
    ...aiResponse,
    // Always attach the raw retrieved cases so the frontend can display them
    retrievedPrecedents: prosecutionCases,
    defenseRetrievedPrecedents: defenseCases,
  };
}

// ─── 3. Final Verdict ─────────────────────────────────────────────────────────

/**
 * Generates the presiding judge's final bench ruling.
 *
 * @param {string} caseId
 * @param {Array}  argHistory   - Full [{role, text}] exchange array
 * @param {number} finalScore   - Aggregate defense score (0-100)
 */
async function generateVerdict(caseId, argHistory, finalScore) {
  // Retrieve landmark precedents for the judge to reference in the ruling
  const verdictQuery = argHistory
    .filter(h => h.role === 'user')
    .map(h => h.text)
    .join(' ');

  const verdictCases = ragService.retrieveRelevantCases(verdictQuery || caseId, 3);
  const verdictCtx = ragService.formatContextBlock(verdictCases, 'judge');

  // Summarise the exchange for the verdict prompt
  const summarisedHistory = argHistory
    .map(h => `[${h.role.toUpperCase()}]: ${h.text.slice(0, 200)}`)
    .join('\n');

  const prompt = `
You are a Supreme Court of India Justice delivering the final bench ruling in a Moot Court simulation.
All precedents, doctrines, and constitutional provisions should be from Indian law.

=== CASE ID ===
${caseId}

=== SESSION SUMMARY ===
Final Petitioner's Performance Score: ${finalScore}%

Exchange Log:
${summarisedHistory}

=== JUDICIAL PRECEDENTS (available for your ruling) ===
${verdictCtx}

=== YOUR TASK ===
Deliver a formal, authoritative judicial ruling in the manner of a Supreme Court of India judgment. Your ruling should:
  - Address the STRENGTHS of the petitioner counsel's constitutional arguments.
  - Address the WEAKNESSES and gaps in their reasoning.
  - Reference at least ONE Indian Supreme Court case from the precedents above.
  - Determine the outcome (WIN/NEUTRAL/LOSS) based on the performance score (${finalScore}%).
  - Provide detailed evaluation metrics for a final report.

Return ONLY a valid JSON object:
{
  "ruling": "...",
  "outcome": "WIN" | "NEUTRAL" | "LOSS",
  "reasoning": "...",
  "strengths": "...",
  "weaknesses": "...",
  "metrics": {
    "proceduralFinesse": <0-100>,
    "precedentApplication": <0-100>,
    "responsivenessScore": <0-100>,
    "logicalStructureScore": <0-100>
  },
  "benchAdvice": "..." // Specific coaching for the user's next session
}
`.trim();

  const outcome = finalScore >= 70 ? 'WIN' : finalScore >= 45 ? 'NEUTRAL' : 'LOSS';
  const fallback = {
    ruling: `The court has deliberated on the arguments presented in case ${caseId}. After careful consideration of the arguments advanced by both sides, the court renders its decision.`,
    outcome,
    reasoning: `The defense achieved a performance score of ${finalScore}%, reflecting ${outcome === 'WIN' ? 'strong legal reasoning and effective use of precedent' : outcome === 'NEUTRAL' ? 'adequate arguments but notable gaps in legal grounding' : 'insufficient legal precision and limited engagement with controlling precedent'}.`,
    strengths: 'The defense demonstrated some understanding of the core legal issues.',
    weaknesses: 'Greater precision in citing controlling precedent would have strengthened the position.',
    metrics: {
      proceduralFinesse: finalScore,
      precedentApplication: Math.max(0, finalScore - 5),
      responsivenessScore: Math.min(100, finalScore + 5),
      logicalStructureScore: finalScore
    },
    benchAdvice: 'Focus on connecting the facts of the case directly to the specific Articles of the Constitution invoked.'
  };

  return await callGemini(prompt, fallback);
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  generateOpening,
  processArgument,
  generateVerdict,
};
