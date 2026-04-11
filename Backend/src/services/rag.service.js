/**
 * RAG Service — Retrieval-Augmented Generation for Legal Cases
 *
 * Loads 100 landmark legal cases into memory and provides multi-strategy
 * semantic retrieval for both the Prosecution and Defense.
 *
 * Retrieval strategies:
 *   1. TF-IDF keyword overlap    — broad lexical matching
 *   2. Tag-set intersection      — category/domain matching
 *   3. Jurisdiction boost        — same-court precedents weighted higher
 *   4. Year recency boost        — more recent cases slightly favoured
 *   5. Adversarial counter-case  — cases that cut AGAINST the user's argument
 *
 * Public API
 * ----------
 *   retrieveForProsecution(userArg, caseId, topK)
 *   retrieveForDefense(userArg, caseId, topK)
 *   retrieveForOpening(caseData, topK)
 *   formatContextBlock(cases, perspective)
 */

const legalCases = require('../data/indian-legal-cases.json');

// ─── Stop-words ─────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'the','and','for','that','this','with','was','are','has','have',
  'its','not','but','from','they','their','been','would','can',
  'will','does','did','you','your','his','her','him','our','who',
  'what','when','where','which','into','than','such','under','also',
  'any','all','one','two','may','must','shall','upon','whether',
  'per','each','both','being','held','act','court','case','rule',
  'law','legal','argue','argued','argument','argues',
]);

// ─── Utilities ────────────────────────────────────────────────────────────────

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

function filterTokens(tokens) {
  return tokens.filter(t => !STOP_WORDS.has(t));
}

/**
 * Build a normalised TF map for a piece of text.
 */
function buildTF(text) {
  const tokens = filterTokens(tokenize(text));
  const map = {};
  for (const t of tokens) map[t] = (map[t] || 0) + 1;
  const max = Math.max(...Object.values(map), 1);
  for (const t in map) map[t] /= max;          // normalise 0-1
  return map;
}

/**
 * Cosine-style overlap score between two TF maps.
 */
function tfOverlap(mapA, mapB) {
  let score = 0;
  for (const t in mapA) {
    if (mapB[t]) score += mapA[t] * mapB[t];
  }
  return score;
}

// Pre-compute TF maps for every case field once at startup
const caseIndexes = legalCases.map(c => ({
  ...c,
  _tf: buildTF([c.title, c.summary, c.holding, c.principle, ...c.tags].join(' ')),
  _tagSet: new Set(c.tags.map(t => t.toLowerCase())),
  _titleTokens: new Set(filterTokens(tokenize(c.title))),
}));

// ─── Scoring Strategies ──────────────────────────────────────────────────────

/**
 * Core TF-IDF-style score — how relevant is the case to the query?
 */
function scoreTFIDF(legalCase, queryTF) {
  return tfOverlap(queryTF, legalCase._tf);
}

/**
 * Tag-intersection bonus — domain alignment bonus.
 */
function scoreTagIntersection(legalCase, queryTokens) {
  let bonus = 0;
  for (const qt of queryTokens) {
    if (legalCase._tagSet.has(qt)) bonus += 0.15;
    // Partial match: query token contained inside a tag
    for (const tag of legalCase._tagSet) {
      if (tag.includes(qt) && qt.length > 3) bonus += 0.05;
    }
  }
  return bonus;
}

/**
 * Recency boost — slightly prefer modern cases (post-2000).
 */
function scoreRecency(legalCase) {
  if (legalCase.year >= 2015) return 0.08;
  if (legalCase.year >= 2000) return 0.04;
  if (legalCase.year >= 1980) return 0.01;
  return 0;
}

/**
 * Jurisdiction match boost — same court carries more authority.
 */
function scoreJurisdiction(legalCase, targetJurisdiction) {
  if (!targetJurisdiction) return 0;
  const tj = targetJurisdiction.toLowerCase();
  const cj = legalCase.jurisdiction.toLowerCase();
  if (cj === tj) return 0.12;
  if (cj.includes('supreme') && tj.includes('supreme')) return 0.06;
  return 0;
}

// ─── Composite Scorer ────────────────────────────────────────────────────────

/**
 * Returns a combined relevance score for a case given a query.
 * @param {Object}  legalCase
 * @param {Object}  queryTF           - pre-computed TF map of the query
 * @param {string[]} queryTokens       - filtered tokens
 * @param {Object}  opts              - { jurisdiction, invertSignal }
 */
function scoreCase(legalCase, queryTF, queryTokens, opts = {}) {
  const tfidf   = scoreTFIDF(legalCase, queryTF);
  const tags    = scoreTagIntersection(legalCase, queryTokens);
  const recency = scoreRecency(legalCase);
  const juris   = scoreJurisdiction(legalCase, opts.jurisdiction);

  let combined = tfidf + tags + recency + juris;

  // Adversarial mode: invert to find *counter-precedents*.
  // Cases that are relevant to the topic but whose holding contradicts
  // the defence position (e.g. cases favouring state/prosecution).
  if (opts.invertSignal) {
    // Heuristic: cases where the state/government prevailed — relevant for Indian SC
    const pro_govt_tokens = new Set([
      'government','state','prosecution','upheld','affirm','convicted',
      'liability','guilty','dismissed','constitutional','valid','rejected',
      'union','writ','dismissed','penalty','regulatory',
    ]);
    const holdingTokens = new Set(filterTokens(tokenize(legalCase.holding)));
    let govBonus = 0;
    for (const t of pro_govt_tokens) if (holdingTokens.has(t)) govBonus += 0.05;
    combined += govBonus;
  }

  return combined;
}

// ─── Retrieval Functions ─────────────────────────────────────────────────────

/**
 * Generic internal retrieval.
 */
function _retrieve(query, opts = {}, topK = 3) {
  const { jurisdiction, invertSignal, excludeIds = [] } = opts;
  const queryTokens = filterTokens(tokenize(query));
  const queryTF     = buildTF(query);

  if (queryTokens.length === 0) {
    return legalCases.slice(0, topK).map(c => ({ ...c, relevanceScore: 0, strategy: 'fallback' }));
  }

  const scored = caseIndexes
    .filter(c => !excludeIds.includes(c.id))
    .map(c => ({
      ...c,
      relevanceScore: scoreCase(c, queryTF, queryTokens, { jurisdiction, invertSignal }),
    }))
    .filter(c => c.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK);

  if (scored.length === 0) {
    return legalCases.slice(0, topK).map(c => ({ ...c, relevanceScore: 0, strategy: 'fallback' }));
  }

  return scored;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Retrieve supporting precedents for the PROSECUTION.
 * Strategy: high relevance to topic + adversarial inversion (prefer govt-wins).
 *
 * @param {string} userArg    - The defence counsel's argument text
 * @param {string} topicHint  - Short topic string from caseData (e.g. "Fourth Amendment")
 * @param {number} topK
 * @returns {Array}
 */
function retrieveForProsecution(userArg, topicHint = '', topK = 4) {
  const query = `${userArg} ${topicHint}`;

  // 1st pass — topic-level retrieval with adversarial inversion
  const adversarial = _retrieve(query, { invertSignal: true }, topK);

  // 2nd pass — pure topic proximity (to ensure we don't miss critical cases)
  const supportive   = _retrieve(topicHint || userArg, {}, topK);

  // Merge, deduplicate, take best topK
  const seen = new Set();
  const merged = [];
  for (const c of [...adversarial, ...supportive]) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      merged.push(c);
    }
  }
  return merged
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK)
    .map(c => ({ ...c, strategy: 'prosecution' }));
}

/**
 * Retrieve supporting precedents for the DEFENCE.
 * Strategy: pure relevance — find the best cases for the defence position.
 *
 * @param {string} userArg
 * @param {string} topicHint
 * @param {number} topK
 * @returns {Array}
 */
function retrieveForDefense(userArg, topicHint = '', topK = 3) {
  const query = `${userArg} ${topicHint}`;
  return _retrieve(query, { invertSignal: false }, topK)
    .map(c => ({ ...c, strategy: 'defense' }));
}

/**
 * Retrieve relevant precedents for the OPENING STATEMENTS.
 * Uses the full case metadata (title + topic + precedents list) as query.
 *
 * @param {Object} caseData  - { title, topic, precedents[] }
 * @param {number} topK
 * @returns {Array}
 */
function retrieveForOpening(caseData, topK = 3) {
  const query = [
    caseData.title,
    caseData.topic,
    ...(caseData.precedents || []),
  ].join(' ');
  return _retrieve(query, {}, topK)
    .map(c => ({ ...c, strategy: 'opening' }));
}

/**
 * Legacy function kept for backward compatibility.
 */
function retrieveRelevantCases(query, topK = 3) {
  return _retrieve(query, {}, topK);
}

// ─── Formatting ──────────────────────────────────────────────────────────────

/**
 * Format retrieved cases into a rich context block for Gemini prompts.
 *
 * @param {Array}  cases       - Retrieved case objects
 * @param {string} perspective - 'prosecution' | 'defense' | 'judge' | 'opening'
 * @returns {string}
 */
function formatContextBlock(cases, perspective = 'general') {
  if (!cases || cases.length === 0) {
    return 'No directly relevant precedents retrieved.';
  }

  const perspectiveLabel = {
    prosecution: 'PROSECUTION PRECEDENT',
    defense:     'DEFENSE PRECEDENT',
    judge:       'JUDICIAL PRECEDENT',
    opening:     'OPENING PRECEDENT',
    general:     'RETRIEVED PRECEDENT',
  }[perspective] || 'RETRIEVED PRECEDENT';

  return cases
    .map((c, i) => `
[${perspectiveLabel} ${i + 1}] — Relevance: ${(c.relevanceScore * 100).toFixed(0)}%
Case: ${c.title} (${c.year})
Jurisdiction: ${c.jurisdiction}
Holding: ${c.holding}
Principle: ${c.principle}
Key Facts: ${c.summary}
Tags: ${c.tags.join(', ')}
`.trim())
    .join('\n\n');
}

/**
 * Build a compact citation string for inline use inside prompts.
 * e.g.  "Carpenter v. US (2018); Riley v. California (2014)"
 */
function formatCitationInline(cases) {
  return cases.map(c => `${c.title} (${c.year})`).join('; ');
}

// ─── Exports ─────────────────────────────────────────────────────────────────
module.exports = {
  // Primary API
  retrieveForProsecution,
  retrieveForDefense,
  retrieveForOpening,
  formatContextBlock,
  formatCitationInline,

  // Legacy / utility
  retrieveRelevantCases,
};
