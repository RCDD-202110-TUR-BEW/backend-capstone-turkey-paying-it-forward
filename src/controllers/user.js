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
      if (!user) throw new Error("The user with the specified ID wasn't found");
      res.json(user);
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

      if (!updatedUser)
        throw new Error("The user with the specified ID wasn't found");

      res.json(updatedUser);
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },

  // TODO: make sure to add authorization
  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      await UserModel.findByIdAndRemove(id);
      res.status(204).end();
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
  getAllDonators: async (req, res) => {
    res.send('All donators');
  },
};
