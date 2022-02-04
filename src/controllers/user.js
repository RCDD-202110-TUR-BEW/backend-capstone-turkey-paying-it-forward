const UserModel = require('../models/user');

module.exports = {
  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.find();
      res.json(users);
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
  getSingleUser: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await UserModel.findById(id);
      res.status(200).json(user);
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
  updateUser: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        {
          new: true,
        }
      );

      if (!updatedUser) {
        res
          .status(422)
          .json({ message: "The user with the specified id wasn't found" });
      } else {
        res.json(updatedUser);
      }
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await UserModel.findByIdAndRemove(id);
      res.status(204).json(user);
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
  getAllDonators: async (req, res) => {
    res.send('All donators');
  },
};
