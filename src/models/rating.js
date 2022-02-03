const mongoose = require('mongoose');

const { Schema } = mongoose;

const raterSchema = Schema({
  raterId: {
    type: Schema.Types.ObjectId,
    ref: process.env.USER_MODEL_NAME,
    required: [true, 'Rater ID is required'],
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: [true, 'Rating value is required'],
  },
});

const ratingSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: process.env.USER_MODEL_NAME,
    required: [true, 'User reference is required'],
  },
  raters: {
    type: [raterSchema],
    default: [],
  },
});

ratingSchema.set('toJSON', { virtuals: true });

ratingSchema.virtual('averageRating').get(function () {
  let sum = 0;
  this.raters.forEach((rater) => {
    sum += rater.rating;
  });
  return sum / this.raters.length;
});

const modelName = process.env.RATING_MODEL_NAME;
module.exports = mongoose.model(modelName, ratingSchema);
