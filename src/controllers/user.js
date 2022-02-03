const UserModel = require('../models/user');

module.exports = {
  getAllUsers: (req, res) => {
    res.send('All users');
  },
  getSingleUser: (req, res) => {
    res.send('Single user');
  },
  updateUser: (req, res) => {
    res.send('User with the specified ID has been updated');
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
      res.json(donators);
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
};
