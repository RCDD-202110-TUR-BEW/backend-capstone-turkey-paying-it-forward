/* this middleware is called after the the user-authentication middleware to verify
 that user is allowed to access some item endpoints that need authorization to be accessed */
const Item = require('../models/item');

module.exports = async (req, res, next) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId);
    /* eslint-disable no-underscore-dangle */
    // check if item exists and if user is the owner of the item
    if (item && item.owner.toString() === req.user._id) {
      return next();
    }
    return res
      .status(401)
      .json({ message: 'unauthorized to modify requested item' });
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'unauthorized to modify requested item' });
  }
};
