// src/services/permissionManager.js

const crypto = require('crypto');
const { Permission, PERMISSION_TYPES } = require('../models/permissionModel');

const PERMISSION_HIERARCHY = {
  'READ': 1,
  'WRITE': 2,
  'ADMIN': 3
};

const ACTION_TO_MIN_LEVEL = {
  get: 'READ',
  search: 'READ',
  update: 'WRITE',
  patch: 'WRITE',
  post: 'WRITE',
  delete: 'ADMIN'
};

class PermissionManager {
  constructor({ logger = console, debug = false } = {}) {
    this.permissions = new Map();
    this.byFile = new Map();
    this.byUser = new Map();
    this.logger = logger;
    this.debug = debug;
  }

  // ==========================================================
  // PUBLIC API - CRUD
  // ==========================================================

  // --- CREATE ---
  createPermission(fileId, userId, type, metadata = {}) {
    this._validateRequired(fileId, userId, type);

    // Check strict uniqueness
    if (this.getFilePermissions(fileId).some(p => p.userId === userId)) {
      throw new Error(`Permission already exists for user ${userId} on file ${fileId}. Use PATCH to update.`);
    }

    const id = crypto.randomUUID();
    const permission = new Permission(id, fileId, userId, type, metadata);

    this.permissions.set(id, permission);
    this._ensureSet(this.byFile, fileId).add(id);
    this._ensureSet(this.byUser, userId).add(id);

    this._log(`Permission created: ${id}`);
    return permission;
  }

  // --- READ ---
  getPermission(permissionId) {
    return this.permissions.get(permissionId) || null;
  }

  getPermissionOrThrow(permissionId) {
    const p = this.getPermission(permissionId);
    if (!p) throw new Error(`Permission not found: ${permissionId}`);
    return p;
  }

  getFilePermissions(fileId) {
    if (!fileId) throw new Error('fileId is required');
    const ids = this.byFile.get(fileId);
    if (!ids) return [];

    return Array.from(ids)
      .map(id => this.permissions.get(id))
      .filter(Boolean);
  }

  getUserPermissions(userId, action = null) {
    if (!userId) throw new Error('userId is required');
    const ids = this.byUser.get(userId);
    if (!ids) return [];

    const requiredLevel = this._requiredLevelFromAction(action);

    return Array.from(ids)
      .map(id => this.permissions.get(id))
      .filter(Boolean)
      .filter(p => {
        if (requiredLevel == null) return true;
        return (PERMISSION_HIERARCHY[p.type] || 0) >= requiredLevel;
      });
  }

  // --- UPDATE ---
  updatePermission(permissionId, updates = {}) {
    const permission = this.getPermissionOrThrow(permissionId);

    if (updates.type) {
      if (!PERMISSION_TYPES.includes(updates.type)) {
        throw new Error(`Invalid permission type: ${updates.type}`);
      }
      permission.type = updates.type;
    }

    if (updates.metadata) {
      permission.metadata = { ...permission.metadata, ...updates.metadata };
    }

    this._log(`Permission updated: ${permissionId}`);
    return permission;
  }

  // --- DELETE ---
  deletePermission(permissionId) {
    const permission = this.getPermissionOrThrow(permissionId);

    const fileSet = this.byFile.get(permission.fileId);
    if (fileSet) {
      fileSet.delete(permissionId);
      if (fileSet.size === 0) this.byFile.delete(permission.fileId);
    }

    const userSet = this.byUser.get(permission.userId);
    if (userSet) {
      userSet.delete(permissionId);
      if (userSet.size === 0) this.byUser.delete(permission.userId);
    }

    this.permissions.delete(permissionId);
    this._log(`Permission deleted: ${permissionId}`);
    return true;
  }

  // ==========================================================
  // BUSINESS LOGIC
  // ==========================================================

  hasPermission(userId, fileId, action) {
    if (!userId || !fileId || !action) return false;

    let requiredLevel;
    try {
      requiredLevel = this._requiredLevelFromAction(action);
    } catch {
      return false;
    }

    // Find permission logic: (Exists == Active)
    const p = this.getFilePermissions(fileId).find(perm => perm.userId === userId);
    
    if (!p) return false;

    return (PERMISSION_HIERARCHY[p.type] || 0) >= requiredLevel;
  }

  // ==========================================================
  // DEBUG & MAINTENANCE
  // ==========================================================

  resetPermissions() {
    this.permissions.clear();
    this.byFile.clear();
    this.byUser.clear();
  }

  getAllPermissions() {
    return Array.from(this.permissions.values());
  }

  // ==========================================================
  // PRIVATE HELPERS (Internal Use)
  // ==========================================================

  _log(msg) {
    if (this.debug) this.logger.log(msg);
  }

  _ensureSet(map, key) {
    if (!map.has(key)) map.set(key, new Set());
    return map.get(key);
  }

  _validateRequired(fileId, userId, type) {
    if (!fileId || !userId || !type) {
      throw new Error('fileId, userId, and type are required');
    }
    if (!PERMISSION_TYPES.includes(type)) {
      throw new Error(`Invalid permission type: ${type}`);
    }
  }

  _requiredLevelFromAction(action) {
    if (action == null) return null;
    const key = String(action).toLowerCase();
    const minType = ACTION_TO_MIN_LEVEL[key];
    if (!minType) throw new Error(`Unsupported action: ${action}`);
    
    const level = PERMISSION_HIERARCHY[minType];
    if (!level) throw new Error(`Invalid mapped permission type: ${minType}`);
    return level;
  }
}

module.exports = PermissionManager;