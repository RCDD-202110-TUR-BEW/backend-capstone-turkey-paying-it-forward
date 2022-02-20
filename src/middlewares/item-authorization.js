/* this middleware is called after the user-authentication 
to verify that user is authorized to access some protected item endpoints */
const Item = require('../models/item');

module.exports = async (req, res, next) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId);
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
