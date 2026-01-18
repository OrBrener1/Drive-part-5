const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['READ', 'WRITE', 'ADMIN'],
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

PermissionSchema.index({ fileId: 1, userId: 1 }, { unique: true });
PermissionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Permission', PermissionSchema);
