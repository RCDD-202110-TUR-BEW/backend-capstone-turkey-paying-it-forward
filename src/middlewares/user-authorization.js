// this middleware is called after the the isAuth middleware
// and checks if the user is authorized to access the route
module.exports = function (req, res, next) {
  // eslint-disable-next-line no-underscore-dangle
  if (req.user._id === req.params.id) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
