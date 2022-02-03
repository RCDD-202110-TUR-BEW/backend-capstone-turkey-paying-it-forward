const mongoose = require('mongoose');
const isImageUrl = require('is-image-url');

const validator = (url) => isImageUrl(url);
const imageValidator = [validator, 'Please enter a valid image URL!'];

const { Schema } = mongoose;

const requestSchema = new Schema(
  {
    name: {
      type: String,
      maxLength: [
        30,
        'Request name should have max length of 30 characters only.',
      ],
      required: [true, 'Request name is required'],
    },
    type: {
      type: String,
      enum: {
        values: [
          'Books',
          'Stationery',
          'School Books',
          'Novels',
          'Test Books',
          'Furniture',
        ],
        message:
          "Request type should be any one of 'Books', 'Stationery', 'School Books', 'Novels', 'Test Books' or 'Furniture'",
      },
      required: [true, 'Request type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    photo: {
      type: String,
      validate: imageValidator,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: process.env.USER_MODEL_NAME,
      required: [true, 'Owner reference is required'],
    },
  },
  { timestamps: true }
);

const modelName = process.env.REQUEST_MODEL_NAME;
module.exports = mongoose.model(modelName, requestSchema);
