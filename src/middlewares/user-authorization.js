/* this middleware is called after the the user-authentication middleware to verify
 that user is allowed to access some user endpoints that need authorization to be accessed */

module.exports = function (req, res, next) {
  try {
    // eslint-disable-next-line no-underscore-dangle
    if (req.user._id === req.params.id) {
      return next();
    }
    return res
      .status(401)
      .json({ message: 'Unauthorized to to modify the requested user' });
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Unauthorized to to modify the requested user' });
  }
};
