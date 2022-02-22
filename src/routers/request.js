const express = require('express');
const userAuthenticationMiddleware = require('../middlewares/user-authentication');
const requestController = require('../controllers/request');

const router = express.Router();

// GET, POST routes for /api/request/
router
  .get('/', requestController.getAllRequests)
  .post('/', userAuthenticationMiddleware, requestController.createRequest);

//  GET, PUT, DELETE routes for /api/request/:id
router
  .get('/:id', requestController.getRequestById)
  .use('/:id', userAuthenticationMiddleware)
  .put('/:id', requestController.updateRequest)
  .delete('/:id', requestController.deleteRequest);

module.exports = router;
