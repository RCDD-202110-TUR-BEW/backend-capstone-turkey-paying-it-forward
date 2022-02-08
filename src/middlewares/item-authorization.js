const Item = require('../models/item');

module.exports = async (req, res, next) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId);
    /* eslint-disable no-underscore-dangle */
    if (item && item.owner.toString() === req.user._id) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
