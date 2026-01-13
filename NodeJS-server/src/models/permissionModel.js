// src/models/permissionModel.js

// Supported permission types
const PERMISSION_TYPES = Object.freeze(['READ', 'WRITE', 'ADMIN']);

/**
 * Permission domain model
 * Represents a single permission for a user on a file/folder.
 * STRICT SIMPLIFICATION:
 * - No 'status' (Existence in store = Active).
 * - No 'expiresAt' (Permissions are valid until deleted).
 */
class Permission {
  constructor(id, fileId, userId, type, metadata = {}) {
    if (!id) throw new Error('Permission id is required');
    if (!fileId) throw new Error('fileId is required');
    if (!userId) throw new Error('userId is required');

    if (!PERMISSION_TYPES.includes(type)) {
      throw new Error(`Invalid permission type: ${type}`);
    }

    this.id = id;
    this.fileId = fileId;
    this.userId = userId;
    this.type = type;

    this.createdAt = new Date();
    this.metadata = { ...metadata };
  }

  // Serialize permission to plain JSON
  toJSON() {
    return {
      id: this.id,
      fileId: this.fileId,
      userId: this.userId,
      type: this.type,
      createdAt: this.createdAt,
      metadata: this.metadata
    };
  }
}

module.exports = {
  Permission,
  PERMISSION_TYPES
};