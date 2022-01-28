const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

// POST route for /signin
router.post('/signin', authController.signInUser);

// POST route for /signup
router.post('/signup', authController.signUpUser);

// GET route for /signout
router.get('/signout', authController.signOutUser);

module.exports = router;

