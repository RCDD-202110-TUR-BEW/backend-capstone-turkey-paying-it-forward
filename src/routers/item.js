const express = require('express');
const userAuthenticationMiddleware = require('../middlewares/user-authentication');
const itemAuthenticationMiddleware = require('../middlewares/item-authorization');

const router = express.Router();

const itemController = require('../controllers/item');

// GET route for /api/items/available
router.get('/available', itemController.getAvailableItems);

// GET route for /api/items/filter
router.get('/filter', itemController.getFilteredItems);

// POST route for /api/items
router.post('/', userAuthenticationMiddleware, itemController.addItem);

// GET, PUT and DELETE routes for /api/items/:id
router
  .route('/:id')
  .get(itemController.getSingleItem)
  .put(
    userAuthenticationMiddleware,
    itemAuthenticationMiddleware,
    itemController.updateItem
  )
  .delete(
    userAuthenticationMiddleware,
    itemAuthenticationMiddleware,
    itemController.deleteItem
  );

module.exports = router;
