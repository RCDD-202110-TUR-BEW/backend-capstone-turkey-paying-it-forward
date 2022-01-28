const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = Schema({
  userName: {
    type: String,
    required: [true, 'Username is required'],
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  ratingRef: {
    type: Schema.Types.ObjectId,
    ref: process.env.RATING_MODEL_NAME,
  },
});

const modelName = process.env.USER_MODEL_NAME;
module.exports = mongoose.model(modelName, userSchema);
