const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
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
    unique: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
  },
  ratingRef: {
    type: Schema.Types.ObjectId,
    ref: process.env.RATING_MODEL_NAME,
  },
  isDonator: {
    type: Boolean,
    default: false,
  },
});

const modelName = process.env.USER_MODEL_NAME;
module.exports = mongoose.model(modelName, userSchema);
