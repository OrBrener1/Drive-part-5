const mongoose = require('mongoose');

const TrashSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    scope: {
      type: String,
      enum: ['global', 'user'],
      required: true
    },
    originalParentId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

TrashSchema.index({ fileId: 1, scope: 1 });
TrashSchema.index({ userId: 1, scope: 1 });

module.exports = mongoose.model('Trash', TrashSchema);
