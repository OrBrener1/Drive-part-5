const mongoose = require('mongoose');

const RecentSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastOpened: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

RecentSchema.index({ userId: 1, fileId: 1 }, { unique: true });
RecentSchema.index({ userId: 1, lastOpened: -1 });

module.exports = mongoose.model('Recent', RecentSchema);
