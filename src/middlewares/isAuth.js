const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const { token } = req.cookies;
  try {
    const { user } = jwt.verify(token, process.env.JWT_SECRET);
    // if verified pass the user to the next function with the req object
    req.user = user;
    return next();
  } catch (error) {
    // delete the token when it is invalid
    res.clearCookie('token');
    return res.status(401).json({
      message: 'You are not authenticated',
    });
  }
};
