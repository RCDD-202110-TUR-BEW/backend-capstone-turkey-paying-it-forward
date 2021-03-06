/* this middleware is called after the user-authentication 
to verify that user is authorized to access some protected request endpoints */

const Request = require('../models/request');

module.exports = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const request = await Request.findById(requestId);
    // check if request exists and if user is the owner of the request
    if (!request)
      return res.status(422).json({
        message: 'The request with the specified ID was not found.',
      });

    if (request.owner.toString() === req.user._id) {
      return next();
    }
    return res.status(401).json({
      message: 'unauthorized to modify the requested request',
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message ?? error,
    });
  }
};
