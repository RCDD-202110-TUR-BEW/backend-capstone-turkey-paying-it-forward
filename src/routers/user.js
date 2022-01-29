const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');

// GET and POST routes for /
router.route('/').get(userController.getAllUsers).post(userController.addUser);

// GET, PUT, DELETE route for /:id
router
  .route('/:id')
  .get(userController.getSingleUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
