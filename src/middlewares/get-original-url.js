module.exports = (req, res, next) => {
  try {
    req.session.returnTo = req.headers.referer;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: error.message ?? error,
    });
  }
};
