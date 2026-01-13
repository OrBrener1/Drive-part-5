// src/controllers/permissionsController.js

const permissionStore = require('../services/permissionStore');
const filesService = require('../services/filesService');
const userModel = require('../models/usersModel');

// -------------------------
// ID validation helpers
// -------------------------

function isValidFileId(id) {
  return typeof id === 'string' && /^f_\d+_\d+$/.test(id);
}

// Fixed: Loosened regex to accept any 36-character string with hex and dashes.
// This prevents rejection of valid UUIDs that might not strictly match v4 format.
function isValidUuid(id) {
  return typeof id === 'string' && /^[0-9a-fA-F-]{36}$/.test(id);
}

/**
 * Central helper function for access control
 * Checks whether the user is allowed to perform the required action on the file.
 * Supports inheritance (e.g., ADMIN on a folder implies ADMIN on its files).
 */
function ensureAccess(fileId, userId, requiredAction, res) {
  // 1. Fetch the file via the service (also validates existence)
  const result = filesService.getFileById(fileId, userId);

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
  if (!filesService.canUserAccessFile(userId, file, requiredAction)) {
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
function createPermission(req, res) {
  const fileId = req.params.id;
  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }

  // Security check: requires ADMIN permission
  const file = ensureAccess(fileId, req.userId, 'delete', res);
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
    const user = userModel.getUserByEmail(email); 
    
    if (!user) {
      return res.status(404).json({ error: `User with email '${email}' not found` });
    }
    userId = user.id;
  }

  // 2. Prevent self-share (Logic check)
  if (String(userId) === String(req.userId)) {
     return res.status(400).json({ error: 'Cannot share file with yourself' });
  }

  try {
    // Create the permission in the store
    const p = permissionStore.createPermission(fileId, userId, type, metadata || {});

    // 3. Return enriched object immediately
    const userObj = userModel.getUserById(Number(userId));
    
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
function getFilePermissions(req, res) {
  const fileId = req.params.id;
  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }

  // Security check: requires READ permission
  const file = ensureAccess(fileId, req.userId, 'get', res);
  if (!file) return;

  const perms = permissionStore.getFilePermissions(fileId);

  // Enrich each permission with user information (displayName/email)
  const enrichedPerms = perms.map(p => {
    const jsonPerm = p.toJSON ? p.toJSON() : p;

    // Ensure userId type matches the Map key type in the user model (Number)
    const user = userModel.getUserById(Number(jsonPerm.userId));

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
  });

  return res.status(200).json(enrichedPerms);
}

/**
 * Update an existing permission
 * Requires: ADMIN access
 */
function updatePermission(req, res) {
  const fileId = req.params.id;
  const { pId } = req.params;

  // DEBUG LOG: Helps identify what is being sent from frontend
  console.log(`[UpdatePermission] File: ${fileId}, PermID: ${pId}, Body:`, req.body);

  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }
  
  if (!isValidUuid(pId)) {
    console.log('[UpdatePermission] Invalid UUID format');
    return res.status(400).json({ error: 'Invalid permission id format' });
  }

  // Security check: requires ADMIN permission
  const file = ensureAccess(fileId, req.userId, 'delete', res);
  if (!file) return;

  try {
    const existing = permissionStore.getPermissionOrThrow(pId);
    
    // Validate that the permission actually belongs to this file
    if (existing.fileId !== fileId) {
      console.log('[UpdatePermission] ID mismatch');
      return res.status(404).json({ error: 'Permission not found for this file' });
    }

    const updated = permissionStore.updatePermission(pId, req.body || {});
    return res.status(200).json(updated.toJSON ? updated.toJSON() : updated);
  } catch (e) {
    console.error('[UpdatePermission] Error:', e.message);
    return res.status(400).json({ error: e.message });
  }
}

/**
 * Delete a permission
 * Requires: ADMIN access
 */
function deletePermission(req, res) {
  const fileId = req.params.id;
  const { pId } = req.params;

  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }
  if (!isValidUuid(pId)) {
    return res.status(400).json({ error: 'Invalid permission id' });
  }

  // Security check: requires ADMIN permission
  const file = ensureAccess(fileId, req.userId, 'delete', res);
  if (!file) return;

  try {
    const existing = permissionStore.getPermissionOrThrow(pId);
    if (existing.fileId !== fileId) {
      return res.status(404).json({ error: 'Permission not found for this file' });
    }

    permissionStore.deletePermission(pId);
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