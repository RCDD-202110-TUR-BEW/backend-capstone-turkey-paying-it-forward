const ItemModel = require('../models/item');

module.exports = {
  getAllItems: async (req, res) => {
    try {
      const items = await ItemModel.find();
      res.json(items);
    } catch (err) {
      res.status(422).json({ message: err.message });
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
  updateItem: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedItem = await ItemModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
      if (!updatedItem) {
        res
          .status(422)
          .json({ message: 'The item with the specified ID was not found.' });
      } else {
        res.json(updatedItem);
      }
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
  addItem: (req, res) => {
    res.send('New item has been added');
  },
  deleteItem: async (req, res) => {
    const { id } = req.params;
    try {
      const item = await ItemModel.findByIdAndDelete(id);
      if (!item) {
        res
          .status(422)
          .json({ message: 'The item with the specified ID was not found.' });
      } else {
        res.status(204).json({ message: 'The item is successfully deleted.' });
      }
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
};
