const express = require('express');

const router = express.Router();

const itemController = require('../controllers/item');

// GET route for /available
router.get('/available', itemController.getAvailableItems);

// GET, PUT and DELETE routes for /:id
router
  .route('/:id')
  .get(itemController.getSingleItem)
  .put(itemController.updateItem)
  .delete(itemController.deleteItem);

// GET route for /filter
router.get('/filter', itemController.getFilteredItems);

// POST route for /
router.post('/', itemController.addItem);

module.exports = router;
