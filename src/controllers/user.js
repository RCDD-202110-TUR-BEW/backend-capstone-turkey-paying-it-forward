const { ObjectId } = require('mongoose').Types;

const UserModel = require('../models/user');
const ItemModel = require('../models/item');
const RatingModel = require('../models/rating');

module.exports = {
  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.find({}, { password_hash: 0 });
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
      const user = await UserModel.findById(id, { password_hash: 0 });
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
      updatedUser.password_hash = undefined;
      res.json(updatedUser);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },

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
      const donators = await UserModel.find(
        { isDonator: true },
        { password_hash: 0 }
      );
      if (donators.length <= 0) throw new Error('No donators found');
      res.json(donators);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  rateUser: async (req, res) => {
    const { userid } = req.params;
    try {
      if (String(new ObjectId(userid)) !== userid.toString())
        throw new Error('Requested user ID is not valid!');
      const user = await UserModel.findById(userid).populate(
        'rating',
        'raters'
      );
      if (!user) throw new Error("The user with the specified ID wasn't found");
      if (!user.rating) {
        const newRatingData = {
          user: userid,
          raters: [
            {
              raterId: req.user._id,
              rating: req.body.rating,
            },
          ],
        };
        const newRating = await RatingModel.create(newRatingData);
        user.rating = newRating.id;
        await user.save();
        res.status(201).json(newRating);
      } else {
        const newRater = {
          raterId: req.user._id,
          rating: req.body.rating,
        };
        const rating = await RatingModel.findById(user.rating);
        const isRaterExisting = user.rating.raters.find(
          (rater) => rater.raterId.toString() === req.user._id.toString()
        );
        if (isRaterExisting) throw new Error('You had already rated this user');
        rating.raters.push(newRater);
        await rating.save();
        res.status(201).json(rating);
      }
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  updateUserRating: async (req, res) => {
    const { userid } = req.params;
    try {
      if (String(new ObjectId(userid)) !== userid.toString())
        throw new Error('Requested user ID is not valid!');
      const user = await UserModel.findById(userid).populate(
        'rating',
        'raters'
      );
      if (!user) throw new Error("The user with the specified ID wasn't found");
      const rating = await RatingModel.findById(user.rating);
      if (!rating) throw new Error('The user does not have any rating');
      const userRaters = user.rating.raters;
      const indexOfRater = userRaters.findIndex(
        (rater) => rater.raterId.toString() === req.user._id.toString()
      );
      if (indexOfRater > -1) {
        rating.raters[indexOfRater].rating = req.body.rating;
      } else {
        throw new Error('You do not have a rating to update');
      }
      await rating.save();
      await user.save();
      res.json(rating);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  donatedItems: async (req, res) => {
    const { userid } = req.params;
    try {
      if (String(new ObjectId(userid)) !== userid.toString())
        throw new Error('Requested user ID is not valid!');
      const user = await UserModel.findById(userid);
      if (!user) throw new Error("The user with the specified ID wasn't found");
      const donatedItems = await ItemModel.find({ owner: userid }).populate(
        'owner'
      );
      if (donatedItems.length <= 0)
        throw new Error('This user does not have any donatedItems');

      res.json(donatedItems);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
};
