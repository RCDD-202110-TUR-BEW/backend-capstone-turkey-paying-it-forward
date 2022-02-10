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
        { $set: req.body },
        { new: true }
      );
      if (!updatedUser)
        throw new Error("The user with the specified id wasn't found");
      await updatedUser.save();
      res.json(updatedUser);
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
  addUser: (req, res) => {
    res.send('New user has been added');
  },
  deleteUser: (req, res) => {
    res.send('User with the specified ID has been deleted');
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
