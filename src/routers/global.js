const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');
const itemController = require('../controllers/item');

// GET route for /api/global/donators
router.get('/donators', userController.getAllDonators);

// GET route for /api/global/all-items
router.get('/all-items', itemController.getAllItems);

module.exports = router;
