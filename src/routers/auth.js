const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

const { userValidationRules, validate } = require('../middlewares/validators');

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

module.exports = router;
