const express = require('express');
const passport = require('passport');
const { googleAuthCallback, logout, getCurrentUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// @desc    Auth with Google
// @route   GET /auth/google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL + '/login', session: false }),
  googleAuthCallback
);

// @desc    Logout user
// @route   GET /auth/logout
router.get('/logout', logout);

// @desc    Get current logged in user
// @route   GET /auth/me
router.get('/me', protect, getCurrentUser);

module.exports = router;
