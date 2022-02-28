const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth');
const { userValidationRules, validate } = require('../middlewares/validators');
const getOriginalUrl = require('../middlewares/get-original-url');

const router = express.Router();

// POST route for /api/auth/signin
router.post('/signin', authController.signInUser);

// POST route for /api/auth/signup
router.post(
  '/signup',
  userValidationRules(),
  validate,
  authController.signUpUser
);

// GET route for /api/auth/signout
router.get('/signout', authController.signOutUser);

// GET routes for google authentication
router.get(
  '/google',
  getOriginalUrl,
  passport.authenticate('google', { scope: ['profile', 'email', 'openid'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  authController.googleCallback
);

module.exports = router;
