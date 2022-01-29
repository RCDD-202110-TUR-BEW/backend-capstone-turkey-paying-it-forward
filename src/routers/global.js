const express = require('express');

const router = express.Router();

const globalController = require('../controllers/global');

// GET route for /donators
router.get('/donators', globalController.getAllDonators);

// GET route for /all-items
router.get('/all-items', globalController.getAllItems);

module.exports = router;
