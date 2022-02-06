const ItemModel = require('../models/item');

module.exports = {
  getAllItems: (req, res) => {
    res.send('All items');
  },
  getSingleItem: async (req, res) => {
    try {
      const itemId = req.params.id;
      const item = await ItemModel.findById(itemId);
      if (!item) throw new Error('There is no item with the provided id!');
      res.json(item);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  getAvailableItems: async (req, res) => {
    try {
      const availableItems = await ItemModel.find({ isAvailable: true });
      if (availableItems.length <= 0)
        throw new Error('There are no available items at the moment!');
      res.json(availableItems);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  getFilteredItems: async (req, res) => {
    try {
      const typeQuery = req.query.type;
      if (!typeQuery) throw new Error('Type query is required!');
      const filteredItems = await ItemModel.find({
        type: typeQuery,
        isAvailable: true,
      });
      if (filteredItems.length <= 0)
        throw new Error(`There are no available items of type ${typeQuery}!`);
      res.json(filteredItems);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  updateItem: (req, res) => {
    res.send('Item with the specified ID has been updated');
  },
  addItem: async (req, res) => {
    try {
      await ItemModel.create(req.body);
      res.status(201).json({ message: 'Item created successfully.' });
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
  deleteItem: (req, res) => {
    res.send('Item with the specified ID has been deleted');
  },
};
