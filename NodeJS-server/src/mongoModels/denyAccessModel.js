const mongoose = require('mongoose');

const DenyAccessSchema = new mongoose.Schema(
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

DenyAccessSchema.index({ userId: 1, fileId: 1 }, { unique: true });
DenyAccessSchema.index({ userId: 1 });

module.exports = mongoose.model('DenyAccess', DenyAccessSchema);
