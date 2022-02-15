const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');

// GET and POST routes for /api/users
router.get('/', userController.getAllUsers);

// GET, PUT, DELETE route for /api/users/:id
router
  .route('/:id')
  .get(userController.getSingleUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
