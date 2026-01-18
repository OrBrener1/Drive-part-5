const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    // Keep the same id format (e.g. f_xxx / d_xxx) to avoid breaking C++ integration
    _id: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    // "file" | "folder"
    type: {
      type: String,
      enum: ["file", "folder"],
      required: true
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    parentId: {
      type: String,
      ref: "Item",
      default: null
    },

    fullPath: {
      type: String,
      required: true
    },

    // File-only field (kept for backward compatibility)
    contentType: {
      type: String,
      default: "text"
    },

    /*
     * Legacy fields – currently exist in in-memory models.
     * These will later be replaced by dedicated collections:
     * Star, Trash, Recent
     */

    // Per-user state, will be migrated out later
    lastOpened: {
      type: Date,
      default: null
    },

    // Folder-only legacy flags
    isStarred: {
      type: Boolean,
      default: false
    },

    isTrashed: {
      type: Boolean,
      default: false
    },

    // Used for restore functionality
    originalParentId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for common queries
ItemSchema.index({ ownerId: 1, parentId: 1 });
ItemSchema.index({ parentId: 1 });
ItemSchema.index({ ownerId: 1, createdAt: -1 });
ItemSchema.index({ name: 1 });

module.exports = mongoose.model("Item", ItemSchema);
