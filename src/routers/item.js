const express = require('express');

const router = express.Router();

const itemController = require('../controllers/item');

// GET route for /api/items/available
router.get('/available', itemController.getAvailableItems);

// GET route for /api/items/filter
router.get('/filter', itemController.getFilteredItems);

// POST route for /api/items
router.post('/', itemController.addItem);

// GET, PUT and DELETE routes for /api/items/:id
router
  .route('/:id')
  .get(itemController.getSingleItem)
  .put(itemController.updateItem)
  .delete(itemController.deleteItem);

module.exports = router;
