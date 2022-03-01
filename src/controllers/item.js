const { ObjectId } = require('mongoose').Types;
const ItemModel = require('../models/item');

module.exports = {
  getAllItems: async (req, res) => {
    try {
      const items = await ItemModel.find().populate('owner', {
        password_hash: 0,
      });
      if (items.length <= 0) throw new Error('No items found');
      res.json(items);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  getSingleItem: async (req, res) => {
    try {
      const itemId = req.params.id;
      if (String(new ObjectId(itemId)) !== itemId.toString())
        throw new Error('Requested item ID is not valid!');
      const item = await ItemModel.findById(itemId).populate('owner', {
        password_hash: 0,
      });
      if (!item) throw new Error('There is no item with the provided ID!');
      res.json(item);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  getAvailableItems: async (req, res) => {
    try {
      const availableItems = await ItemModel.find({
        isAvailable: true,
      }).populate('owner', {
        password_hash: 0,
      });
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
      if (!typeQuery) throw new Error('Type query parameter is required!');
      const filteredItems = await ItemModel.find({
        type: typeQuery,
        isAvailable: true,
      }).populate('owner', {
        password_hash: 0,
      });
      if (filteredItems.length <= 0)
        throw new Error(`There are no available items of type ${typeQuery}!`);
      res.json(filteredItems);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  updateItem: async (req, res) => {
    const { id } = req.params;
    try {
      // the following line is to make sure that the owner of the item does not get updated
      req.body.owner = req.user._id;
      const updatedItem = await ItemModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      ).populate('owner', {
        password_hash: 0,
      });
      if (!updatedItem) {
        throw new Error('The item with the specified ID was not found.');
      }
      res.json(updatedItem);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  addItem: async (req, res) => {
    try {
      req.body.owner = req.user._id;
      await ItemModel.create(req.body);
      res.status(201).json({ message: 'Item created successfully.' });
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
  deleteItem: async (req, res) => {
    const { id } = req.params;
    try {
      const item = await ItemModel.findByIdAndDelete(id);
      if (!item) {
        throw new Error('The item with the specified ID was not found.');
      }
      res.status(204).end();
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
};
