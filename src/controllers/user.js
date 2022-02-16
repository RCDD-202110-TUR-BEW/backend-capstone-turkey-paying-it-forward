const { ObjectId } = require('mongoose').Types;
const UserModel = require('../models/user');

module.exports = {
  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.find();
      if (users.length <= 0)
        throw new Error('There are no users at the moment!');
      res.json(users);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  getSingleUser: async (req, res) => {
    const { id } = req.params;
    try {
      if (String(new ObjectId(id)) !== id.toString())
        throw new Error('Requested user ID is not valid!');
      const user = await UserModel.findById(id);
      if (!user) throw new Error("The user with the specified ID wasn't found");
      res.json(user);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    try {
      if (String(new ObjectId(id)) !== id.toString())
        throw new Error('Requested user ID is not valid!');
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        {
          new: true,
        }
      );

      if (!updatedUser)
        throw new Error("The user with the specified ID wasn't found");

      res.json(updatedUser);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },

  // TODO: make sure to add authorization
  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      if (String(new ObjectId(id)) !== id.toString())
        throw new Error('Requested user ID is not valid!');
      const deletedUser = await UserModel.findByIdAndRemove(id);
      if (!deletedUser)
        throw new Error("The user with the specified ID wasn't found");
      res.status(204).end();
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  getAllDonators: async (req, res) => {
    try {
      const donators = await UserModel.find({ isDonator: true });
      if (donators.length <= 0) throw new Error('No donators found');
      else res.json(donators);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
};
