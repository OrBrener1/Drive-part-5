// binStore.js
//
// Is in Singleton design pattern. It is representing Trash state.
// Supports: Global bin (owner deletes → hidden from everyone) and 
// Per-user bin (non-owner hides for self only)

const filesRepository = require('../repositories/filesRepository');

class BinStore {
  constructor() {
    // Owner moved → hidden for everyone
    this.globalBin = new Set();

    // Non-owner moved → hidden only for that user
    // Map<userId, Set<fileId>>
    this.binByUser = new Map();
  }

  // -------------------------
  // Internal helper
  // -------------------------
  ensureSet(userId) {
    if (!this.binByUser.has(userId)) {
      this.binByUser.set(userId, new Set());
    }
    return this.binByUser.get(userId);
  }

  // -------------------------
  // Global (owner) bin
  // -------------------------
  addToGlobalBin(fileId) {
    this.globalBin.add(fileId);
  }

  removeFromGlobalBin(fileId) {
    this.globalBin.delete(fileId);
  }

  isInGlobalBin(fileId) {
    return this.globalBin.has(fileId);
  }

  // -------------------------
  // User-specific bin
  // -------------------------
  moveToUserBin(userId, fileId) {
    this.ensureSet(userId).add(fileId);
  }

  restoreFromUserBin(userId, fileId) {
    this.binByUser.get(userId)?.delete(fileId);
  }

  isInUserBin(userId, fileId) {
    return this.binByUser.get(userId)?.has(fileId) ?? false;
  }

  // -------------------------
  // Hierarchy-aware checks
  // -------------------------
  isItemOrAncestorInBin(userId, fileId) {
    let currentId = fileId;

    while (currentId) {
      if (
        this.isInGlobalBin(currentId) ||
        this.isInUserBin(userId, currentId)
      ) {
        return true;
      }

      const item = filesRepository.getFileById(currentId);
      if (!item) return false;

      currentId = item.parentId;
    }

    return false;
  }

  // -------------------------
  // Read APIs
  // -------------------------
  isHiddenForUser(userId, fileId) {
    return (
      this.isInGlobalBin(fileId) ||
      this.isInBin(userId, fileId)
    );
  }

  getBinIds(userId) {
    return Array.from(this.binByUser.get(userId) ?? []);
  }

  // -------------------------
  // Cleanup
  // -------------------------
  removeEverywhere(fileId) {
    this.globalBin.delete(fileId);
    for (const set of this.binByUser.values()) {
      set.delete(fileId);
    }
  }
}

module.exports = new BinStore();