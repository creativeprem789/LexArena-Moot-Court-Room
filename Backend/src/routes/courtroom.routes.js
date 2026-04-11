const express = require('express');
const router  = express.Router();
const courtroomService = require('../services/courtroom.service');

/**
 * POST /api/courtroom/start
 * Initialize a moot court session — generate opening statements.
 * Body: { caseId, caseData: { title, topic, precedents[], judge, prosecution, defense } }
 */
router.post('/start', async (req, res) => {
  const { caseId, caseData } = req.body;
  if (!caseId || !caseData) {
    return res.status(400).json({ error: 'caseId and caseData are required.' });
  }
  try {
    const openingRecs = await courtroomService.generateOpening(caseId, caseData);
    res.json(openingRecs);
  } catch (err) {
    console.error('[/start]', err);
    res.status(500).json({ error: 'Failed to initialize courtroom session.' });
  }
});

/**
 * POST /api/courtroom/argue
 * Submit a user rebuttal; receive prosecution rebuttal, judge question, score.
 * Body: {
 *   caseId    : string,
 *   userArg   : string,
 *   history   : [{ role: string, text: string }],
 *   caseMeta  : { topic: string }   ← NEW: optional topic hint for RAG
 * }
 */
router.post('/argue', async (req, res) => {
  const { caseId, userArg, history, caseMeta } = req.body;
  if (!caseId || !userArg) {
    return res.status(400).json({ error: 'caseId and userArg are required.' });
  }
  try {
    const response = await courtroomService.processArgument(
      caseId,
      userArg,
      history  || [],
      caseMeta || {}
    );
    res.json(response);
  } catch (err) {
    console.error('[/argue]', err);
    res.status(500).json({ error: 'Failed to process court argument.' });
  }
});

/**
 * POST /api/courtroom/verdict
 * Get the final ruling based on the full session history.
 * Body: { caseId, argHistory, finalScore }
 */
router.post('/verdict', async (req, res) => {
  const { caseId, argHistory, finalScore } = req.body;
  if (!caseId || !argHistory) {
    return res.status(400).json({ error: 'caseId and argHistory are required.' });
  }
  try {
    const verdict = await courtroomService.generateVerdict(
      caseId,
      argHistory,
      finalScore || 50
    );
    res.json(verdict);
  } catch (err) {
    console.error('[/verdict]', err);
    res.status(500).json({ error: 'Failed to generate courtroom verdict.' });
  }
});

module.exports = router;
