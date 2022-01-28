const express = require('express');

const router = express.Router();

const itemController = require('../controllers/item');

// GET route for /
router.get('/', itemController.getAllItems);

// GET route for /available
router.get('/available', itemController.getAvailableItems);

// GET, PUT, DELETE route for /:id
router
  .route('/:id')
  .get(itemController.getSingleItem)
  .put(itemController.updateItem)
  .delete(itemController.deleteItem);

// GET route for /filter
router.get('/filter', itemController.getFilteredItems);

// POST route for /item
router.post('/item', itemController.addItem);

module.exports = router;
