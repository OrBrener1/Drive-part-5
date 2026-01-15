const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    displayName: {
      type: String,
      required: true
    },

    image: {
      type: String,
      default: null
    },

    // replaces themeStore
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', UserSchema);
