const mongoose = require('mongoose');
const permissionService = require('../mongoServices/permissionService');
const filesService = require('../services/filesService');
const userService = require('../mongoServices/userService');

const PERMISSION_HIERARCHY = {
  READ: 1,
  WRITE: 2,
  ADMIN: 3
};

// -------------------------
// ID validation helpers
// -------------------------

function isValidFileId(id) {
  return typeof id === 'string' && /^f_\d+_\d+$/.test(id);
}

function isValidPermissionId(id) {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
}

/**
 * Central helper function for access control
 * Checks whether the user is allowed to perform the required action on the file.
 * Supports inheritance (e.g., ADMIN on a folder implies ADMIN on its files).
 */
async function ensureAccess(fileId, userId, requiredAction, res) {
  // 1. Fetch the file via the service (also validates existence)
  const result = await filesService.getFileById(fileId, userId);

  if (!result || result.status === 'NOT_FOUND') {
    res.status(404).json({ error: 'File not found' });
    return null;
  }

  // If the user does not even have basic READ access, getFileById returns FORBIDDEN
  if (result.status === 'FORBIDDEN') {
    res.status(403).json({ error: 'Access denied' });
    return null;
  }

  const file = result.file;

  // 2. Check permission for the specific action
  if (!await filesService.canUserAccessFile(userId, file, requiredAction)) {
    res.status(403).json({ error: 'Insufficient permissions' });
    return null;
  }

  return file;
}

/**
 * Create a new permission (Share file)
 * Supports sharing by userId OR by email.
 * Requires: ADMIN access (mapped via the 'delete' action).
 */
async function createPermission(req, res) {
  const fileId = req.params.id;
  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }

  // Security check: requires ADMIN permission
  const file = await ensureAccess(fileId, req.userId, 'delete', res);
  if (!file) return;

  // Extract fields - support both userId OR email
  let { userId, email, type, metadata } = req.body || {};

  // Validation
  if (!type) {
    return res.status(400).json({ error: 'Permission type is required' });
  }
  if (!userId && !email) {
    return res.status(400).json({ error: 'Must provide either userId or email' });
  }

  // 1. If email is provided, resolve it to userId
  if (email && !userId) {
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: `User with email '${email}' not found` });
    }
    userId = user._id;
  }

  // 2. Prevent self-share (Logic check)
  if (String(userId) === String(req.userId)) {
    return res.status(400).json({ error: 'Cannot share file with yourself' });
  }

  try {
    // Create the permission in the store
    const p = await permissionService.createPermission(fileId, userId, type, metadata || {});

    // 3. Return enriched object immediately
    const userObj = await userService.getUserById(userId);

    const response = {
      ...(p.toJSON ? p.toJSON() : p),
      user: userObj ? {
        displayName: userObj.displayName,
        email: userObj.email,
        image: userObj.image
      } : { displayName: 'Unknown', email: '' }
    };

    return res.status(201).json(response);

  } catch (e) {
    if (e.message && e.message.includes('already exists')) {
      return res.status(409).json({ error: 'User already has permission. Update existing permission instead.' });
    }
    return res.status(400).json({ error: e.message });
  }
}

/**
 * Get all permissions for a file
 * Requires: READ access (mapped via the 'get' action)
 */
async function getFilePermissions(req, res) {
  const fileId = req.params.id;
  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }

  // Security check: requires READ permission
  const file = await ensureAccess(fileId, req.userId, 'get', res);
  if (!file) return;

  const perms = await permissionService.getFilePermissions(fileId);

  // Enrich each permission with user information (displayName/email)
  const enrichedPerms = await Promise.all(perms.map(async p => {
    const jsonPerm = p.toJSON ? p.toJSON() : p;
    const user = await userService.getUserById(jsonPerm.userId);

    return {
      ...jsonPerm,
      user: user ? {
        displayName: user.displayName,
        email: user.email,
        image: user.image
      } : {
        displayName: 'Unknown',
        email: ''
      }
    };
  }));

  return res.status(200).json(enrichedPerms);
}

/**
 * Update an existing permission
 * Requires: ADMIN access
 */
async function updatePermission(req, res) {
  const fileId = req.params.id;
  const { pId } = req.params;

  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }

  if (!isValidPermissionId(pId)) {
    return res.status(400).json({ error: 'Invalid permission id format' });
  }

  try {
    const existing = await permissionService.getPermissionOrThrow(pId);

    // Validate that the permission actually belongs to this file
    if (existing.fileId !== fileId) {
      return res.status(404).json({ error: 'Permission not found for this file' });
    }

    const isSelf = String(existing.userId) === String(req.userId);

    if (isSelf) {
      const file = await ensureAccess(fileId, req.userId, 'get', res);
      if (!file) return;

      if (req.body && req.body.type) {
        const currentLevel = PERMISSION_HIERARCHY[existing.type] || 0;
        const requestedLevel = PERMISSION_HIERARCHY[req.body.type] || 0;

        if (requestedLevel > currentLevel) {
          return res.status(403).json({ error: 'Cannot increase your own permission' });
        }
      }
    } else {
      const file = await ensureAccess(fileId, req.userId, 'delete', res);
      if (!file) return;
    }

    const updated = await permissionService.updatePermission(pId, req.body || {});
    return res.status(200).json(updated.toJSON ? updated.toJSON() : updated);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

/**
 * Delete a permission
 * Requires: ADMIN access
 */
async function deletePermission(req, res) {
  const fileId = req.params.id;
  const { pId } = req.params;

  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }
  if (!isValidPermissionId(pId)) {
    return res.status(400).json({ error: 'Invalid permission id' });
  }

  try {
    const existing = await permissionService.getPermissionOrThrow(pId);
    if (existing.fileId !== fileId) {
      return res.status(404).json({ error: 'Permission not found for this file' });
    }

    const isSelf = String(existing.userId) === String(req.userId);
    if (isSelf) {
      const file = await ensureAccess(fileId, req.userId, 'get', res);
      if (!file) return;
    } else {
      const file = await ensureAccess(fileId, req.userId, 'delete', res);
      if (!file) return;
    }

    await permissionService.deletePermission(pId);
    return res.status(204).send();
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
}

module.exports = {
  createPermission,
  getFilePermissions,
  updatePermission,
  deletePermission
};
