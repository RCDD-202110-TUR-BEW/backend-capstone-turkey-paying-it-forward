const mongoose = require('mongoose');

const { Schema } = mongoose;

const requestSchema = new Schema(
  {
    name: {
      type: String,
      maxLength: [30, "Item name's max length is 30 characters"],
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
          "Item type should be equal to 'Books', 'Stationery', 'School Books', 'Novels', 'Test Books' or 'Furniture'",
      },
      required: [true, 'Item type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    photo: {
      type: String,
    },
    owner: {
      type: { type: Schema.Types.ObjectId, ref: process.env.USER_MODEL_NAME },
      required: [true, 'Owner reference is required'],
    },
  },
  { timestamps: true }
);

const modelName = process.env.REQUEST_MODEL_NAME;
module.exports = mongoose.model(modelName, requestSchema);
