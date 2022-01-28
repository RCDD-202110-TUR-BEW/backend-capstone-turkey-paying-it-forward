const mongoose = require('mongoose');

const { Schema } = mongoose;

const ratingSchema = Schema({
  userRef: {
    type: Schema.Types.ObjectId,
    ref: process.env.USER_MODEL_NAME,
    required: [true, 'User ref is required'],
  },
  raters: {
    type: [Object],
    required: [true, 'Raters are required'],
  },
  averageRate: {
    type: Number,
    required: [true, 'Average rate is required'],
  },
});
const modelName = process.env.RATING_MODEL_NAME;
module.exports = mongoose.model(modelName, ratingSchema);
