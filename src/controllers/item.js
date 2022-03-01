const { ObjectId } = require('mongoose').Types;
const ItemModel = require('../models/item');
const UserModel = require('../models/user');
const logger = require('../services/logger');

module.exports = {
  getAllItems: async (req, res) => {
    try {
      const items = await ItemModel.find();
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
      const item = await ItemModel.findById(itemId);
      if (!item) throw new Error('There is no item with the provided ID!');
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
      if (!typeQuery) throw new Error('Type query parameter is required!');
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
  updateItem: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedItem = await ItemModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
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
      await ItemModel.create(req.body);
      logger.log('info', 'Item added successfully!');
      res.status(201).json({ message: 'Item created successfully.' });
    } catch (err) {
      logger.log('error', err.message);
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

  donateItem: async (req, res) => {
    try {
      const { donateItemId, borrowerId } = req.body;
      if (String(new ObjectId(donateItemId)) !== donateItemId.toString())
        throw new Error('Requested item ID is not valid!');
      if (String(new ObjectId(borrowerId)) !== borrowerId.toString())
        throw new Error('Borrower ID is not valid!');

      const user = await UserModel.findById(borrowerId);
      if (!user)
        throw new Error('The borrower with the specified ID was not found.');

      const item = await ItemModel.findById(donateItemId).populate('owner', {
        password_hash: 0,
      });

      if (!item) {
        throw new Error('The item with the specified ID was not found.');
      }

      if (!item.isAvailable)
        throw new Error(
          'The item with the specified ID is not available for donation.'
        );

      item.count -= 1;
      item.borrowers.push(borrowerId);
      if (item.count === 0) item.isAvailable = false;

      await item.save();
      res.json(item);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
};
