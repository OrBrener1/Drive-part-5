const mongoose = require('mongoose');

const StarSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

StarSchema.index({ userId: 1, fileId: 1 }, { unique: true });
StarSchema.index({ userId: 1 });

module.exports = mongoose.model('Star', StarSchema);
