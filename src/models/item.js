const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemSchema = new Schema({
  name: {
    type: String,
    maxLength: [30, "item name's max length is 30 characters"],
    required: [true, 'Item name is required'],
  },
  type: {
    type: String,
    enum: {
      values: [
        'Books',
        'Stationary',
        'School Books',
        'Novels',
        'Test Books',
        'Furniture',
      ],
      message:
        "Item type should be equal to 'Books', 'Stationary', 'School Books', 'Novels', 'Test Books' or 'Furniture'",
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
  },
  state: {
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
});

const modelName = process.env.ITEM_MODEL_NAME;
module.exports = mongoose.model(modelName, itemSchema);
