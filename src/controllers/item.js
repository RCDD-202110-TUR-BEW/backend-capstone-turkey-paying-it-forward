const ItemModel = require('../models/item');

module.exports = {
  getAllItems: async (req, res) => {
    try {
      const items = await ItemModel.find();
      if (items.length <= 0) throw new Error('No items found');
      else res.json(items);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  getSingleItem: (req, res) => {
    res.send('Single item');
  },
  getAvailableItems: (req, res) => {
    res.send('Available items');
  },
  getFilteredItems: (req, res) => {
    res.send('Filtered items');
  },
  updateItem: (req, res) => {
    res.send('Item with the specified ID has been updated');
  },
  addItem: (req, res) => {
    res.send('New item has been added');
  },
  deleteItem: (req, res) => {
    res.send('Item with the specified ID has been deleted');
  },
};
