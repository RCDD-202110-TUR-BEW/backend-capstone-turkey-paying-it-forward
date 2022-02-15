const UserModel = require('../models/user');

module.exports = {
  // Temporary code added, to be merged and updated in upcoming PR
  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.find();
      res.json(users);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  getSingleUser: async (req, res) => {
    res.send('Single user');
  },
  // Temporary code added, to be merged and updated in upcoming PR
  updateUser: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
      if (!updatedUser)
        throw new Error("The user with the specified ID wasn't found");
      await updatedUser.save();
      res.json(updatedUser);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  deleteUser: (req, res) => {
    res.send('User with the specified ID has been deleted');
  },
  getAllDonators: async (req, res) => {
    try {
      const donators = await UserModel.find({ isDonator: true });
      if (donators.length <= 0) throw new Error('No donators found');
      res.json(donators);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
};
