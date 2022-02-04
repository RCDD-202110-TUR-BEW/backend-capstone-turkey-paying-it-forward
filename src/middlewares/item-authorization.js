/* eslint-disable no-underscore-dangle */
const Item = require('../models/item');

module.exports = async (req, res, next) => {
  const itemId = req.params.id;
  const item = await Item.findById(itemId);
  if (item && item.owner._id.toString() === req.user._id) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
