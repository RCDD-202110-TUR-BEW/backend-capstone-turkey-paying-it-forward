const mongoose = require('mongoose');
const isImageUrl = require('is-image-url');

const validator = (url) => isImageUrl(url);
const imageValidator = [validator, 'Please enter a valid image URL!'];

const { Schema } = mongoose;

const itemSchema = new Schema(
  {
    name: {
      type: String,
      maxLength: [
        30,
        'Item name should have max length of 30 characters only.',
      ],
      required: [true, 'Item name is required'],
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
          "Item type should be any one of 'Books', 'Stationery', 'School Books', 'Novels', 'Test Books' or 'Furniture'",
      },
      required: [true, 'Item type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    photo: {
      type: String,
      required: [true, 'Item photo is required'],
      validate: imageValidator,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    borrowers: {
      type: [{ type: Schema.Types.ObjectId, ref: process.env.USER_MODEL_NAME }],
      default: [],
    },
    owner: {
      type: { type: Schema.Types.ObjectId, ref: process.env.USER_MODEL_NAME },
      required: [true, 'Owner reference is required'],
    },
  },
  { timestamps: true }
);

const modelName = process.env.ITEM_MODEL_NAME;
module.exports = mongoose.model(modelName, itemSchema);
