const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

// GET route for /
router.get("/", userController.getAllUsers);
  
// GET, PUT, DELETE route for /:id
router
    .route('/:id')
    .get(userController.getSingleUser)
    .put(userController.updateUser)
    .delete(userController.deleteUser);

// POST route for /user
router.post('/user', userController.addUser);

module.exports = router;