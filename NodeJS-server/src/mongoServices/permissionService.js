const permissionRepository = require('../mongoRepository/permissionRepository');
const denyAccessService = require('./denyAccessService');

const PERMISSION_TYPES = ['READ', 'WRITE', 'ADMIN'];
const PERMISSION_HIERARCHY = {
  READ: 1,
  WRITE: 2,
  ADMIN: 3
};

const ACTION_TO_MIN_LEVEL = {
  get: 'READ',
  search: 'READ',
  update: 'WRITE',
  patch: 'WRITE',
  post: 'WRITE',
  delete: 'ADMIN'
};

function requiredLevelFromAction(action) {
  if (action == null) return null;
  const key = String(action).toLowerCase();
  const minType = ACTION_TO_MIN_LEVEL[key];
  if (!minType) throw new Error(`Unsupported action: ${action}`);
  const level = PERMISSION_HIERARCHY[minType];
  if (!level) throw new Error(`Invalid mapped permission type: ${minType}`);
  return level;
}

function validateRequired(fileId, userId, type) {
  if (!fileId || !userId || !type) {
    throw new Error('fileId, userId, and type are required');
  }
  if (!PERMISSION_TYPES.includes(type)) {
    throw new Error(`Invalid permission type: ${type}`);
  }
}

async function createPermission(fileId, userId, type, metadata = {}) {
  validateRequired(fileId, userId, type);

  const existing = await permissionRepository.getByUserAndFile(userId, fileId);
  if (existing) {
    throw new Error(
      `Permission already exists for user ${userId} on file ${fileId}. Use PATCH to update.`
    );
  }

  const permission = await permissionRepository.createPermission(fileId, userId, type, metadata);
  await denyAccessService.removeDeny(userId, fileId);
  return permission;
}

async function getPermission(permissionId) {
  return permissionRepository.getById(permissionId);
}

async function getPermissionOrThrow(permissionId) {
  const permission = await getPermission(permissionId);
  if (!permission) throw new Error(`Permission not found: ${permissionId}`);
  return permission;
}

async function getFilePermissions(fileId) {
  if (!fileId) throw new Error('fileId is required');
  return permissionRepository.getFilePermissions(fileId);
}

async function getUserPermissions(userId, action = null) {
  if (!userId) throw new Error('userId is required');

  const permissions = await permissionRepository.getUserPermissions(userId);
  const requiredLevel = requiredLevelFromAction(action);

  if (requiredLevel == null) return permissions;

  return permissions.filter(permission =>
    (PERMISSION_HIERARCHY[permission.type] || 0) >= requiredLevel
  );
}

async function updatePermission(permissionId, updates = {}) {
  const existing = await getPermissionOrThrow(permissionId);

  if (updates.type && !PERMISSION_TYPES.includes(updates.type)) {
    throw new Error(`Invalid permission type: ${updates.type}`);
  }

  const updated = await permissionRepository.updatePermission(permissionId, updates);
  await denyAccessService.removeDeny(existing.userId, existing.fileId);
  return updated;
}

async function deletePermission(permissionId) {
  await getPermissionOrThrow(permissionId);
  await permissionRepository.deletePermission(permissionId);
  return true;
}

async function deletePermissionByUserAndFile(userId, fileId) {
  return permissionRepository.deletePermissionByUserAndFile(userId, fileId);
}

async function deletePermissionsForFile(fileId) {
  return permissionRepository.deletePermissionsForFile(fileId);
}

async function hasPermission(userId, fileId, action) {
  if (!userId || !fileId || !action) return false;

  const denied = await denyAccessService.hasDeny(userId, fileId);
  if (denied) return false;

  let requiredLevel;
  try {
    requiredLevel = requiredLevelFromAction(action);
  } catch {
    return false;
  }

  const permission = await permissionRepository.getByUserAndFile(userId, fileId);
  if (!permission) return false;

  return (PERMISSION_HIERARCHY[permission.type] || 0) >= requiredLevel;
}

module.exports = {
  createPermission,
  getPermission,
  getPermissionOrThrow,
  getFilePermissions,
  getUserPermissions,
  updatePermission,
  deletePermission,
  deletePermissionByUserAndFile,
  deletePermissionsForFile,
  hasPermission
};
