/*  this middleware is called after the user-authentication
 to verify that user is authorized to access some protected user endpoints */

module.exports = function (req, res, next) {
  try {
    // eslint-disable-next-line no-underscore-dangle
    if (req.user._id === req.params.id) {
      return next();
    }
    return res
      .status(401)
      .json({ message: 'Unauthorized to modify the requested user' });
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Unauthorized to modify the requested user' });
  }
};
