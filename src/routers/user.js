const express = require('express');

const userAuthenticationMiddleware = require('../middlewares/user-authentication');

const userAuthorizationMiddleware = require('../middlewares/user-authorization');

const router = express.Router();

const userController = require('../controllers/user');

// GET route for /api/users
router.get('/', userController.getAllUsers);

// GET, PUT, DELETE routes for /api/users/:id
router
  .route('/:id')
  .get(userController.getSingleUser)
  .put(
    userAuthenticationMiddleware,
    userAuthorizationMiddleware,
    userController.updateUser
  )
  .delete(
    userAuthenticationMiddleware,
    userAuthorizationMiddleware,
    userController.deleteUser
  );

// POST, PUT, DELETE routes for /api/users/rating/:id
router
  .route('/rating/:userid')
  .post(userAuthenticationMiddleware, userController.rateUser)
  .put(userAuthenticationMiddleware, userController.updateUserRating);

module.exports = router;
