const filesRepository = require('../mongoRepository/mongoFileRepository');
const { generateId } = require('./idFileService');
const cppClientService = require('./cppClientService');
const FileSystemItemFactory = require('../models/FileSystemItemFactory');
const permissionService = require('../mongoServices/permissionService');
const starService = require('../mongoServices/starService');
const recentStore = require('./recentStore');
const binService = require('../mongoServices/binService');
const userService = require('../mongoServices/userService');


function sortByCreatedDesc(items) {
  return [...items].sort((a, b) => {
    const aTime = a?.createdAt ? Date.parse(a.createdAt) : 0;
    const bTime = b?.createdAt ? Date.parse(b.createdAt) : 0;
    return bTime - aTime;
  });
}

function normalizeContentForCpp(content) {
  if (typeof content !== 'string') {
    return content;
  }

  const match = content.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return content;
  }

  try {
    return Buffer.from(match[2], 'base64');
  } catch {
    return content;
  }
}

function deriveContentTypeFromContent(content) {
  if (Buffer.isBuffer(content)) {
    return 'image';
  }

  if (typeof content !== 'string') {
    return 'text';
  }

  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(content)
    ? 'image'
    : 'text';
}

// Permission manager to check user permissions (with dynamic inheritance)
const canUserAccessFile = async (userId, file, action) => {
  if (!file) return false;

  // Fast path: owner of the item
  if (String(file.ownerId) === String(userId)) return true;

  // Explicit permission on the item itself
  if (await permissionService.hasPermission(userId, file.id, action)) return true;

  // Walk up ancestors: if user has permission on a parent folder -> inherited access
  const visited = new Set();
  let currentId = file.parentId;

  while (currentId) {
    // Cycle protection
    if (visited.has(currentId)) return false;
    visited.add(currentId);

    const parent = await filesRepository.getFileById(currentId);
    if (!parent) break; // orphan parent

    // Owning an ancestor folder implies full control over descendants
    if (String(parent.ownerId) === String(userId)) return true;

    // Permission on an ancestor implies inherited access
    if (await permissionService.hasPermission(userId, parent.id, action)) return true;

    currentId = parent.parentId;
  }

  return false;
};

//Business logic: get what the user sees
//in the main Drive screen
const getFilesInRootForUser = async (userId) => {
  // My Drive shows only items owned by the user in root, that are not in bin
  const items = await filesRepository.getFilesInRootForUser(userId);

  const visibleRootItems = [];
  for (const item of items) {
    if (!(await binService.isItemOrAncestorInBin(userId, item.id))) {
      visibleRootItems.push(item);
    }
  }

  return await addStarFlag(sortByCreatedDesc(visibleRootItems), userId);
};

// Returns items that are accessible to the user but owned by others
// (used for "Shared with me" view)
const getSharedWithUser = async (userId) => {
  const permissions = await permissionService.getUserPermissions(userId, 'get');

  const items = await Promise.all(
    permissions.map(p => filesRepository.getFileById(p.fileId))
  );

  const filtered = [];
  for (const item of items) {
    if (!item) continue;
    if (String(item.ownerId) === String(userId)) continue;
    if (await binService.isItemOrAncestorInBin(userId, item.id)) continue;
    if (!(await canUserAccessFile(userId, item, 'get'))) continue;
    filtered.push(item);
  }

  const unique = new Map();
  for (const item of filtered) {
    unique.set(item.id, item);
  }
  return await addStarFlag(sortByCreatedDesc(Array.from(unique.values())), userId);
};

// Returns all starred items the user can access (owned or shared, any depth)
const getStarredForUser = async (userId) => {
  const starredIds = await starService.getStarredIds(userId);

  const accessible = [];
  for (const id of starredIds) {
    const item = await filesRepository.getFileById(id);
    if (!item) continue;
    // if item is in bin, i don't want it to appear in starred view
    if (await binService.isItemOrAncestorInBin(userId, item.id)) continue;
    if (!await canUserAccessFile(userId, item, 'get')) continue;
    accessible.push(item);
  }

  return await addStarFlag(accessible, userId);
};

// Returns recent items (owned or shared) per-user, sorted by lastOpened desc, limited to 20.
const getRecentFiles = async (userId) => {
  const recents = recentStore.getUserRecents(userId);

 const items = [];

 for (const entry of recents) {
    const item = await filesRepository.getFileById(entry.fileId);
    if (!item) continue;
    if (await binService.isItemOrAncestorInBin(userId, item.id)) continue;
    if (!(await canUserAccessFile(userId, item, 'get'))) continue;

    items.push({ ...item, lastOpened: entry.lastOpened });
  }

  items.sort((a, b) => {
    const aTime = a.lastOpened ? Date.parse(a.lastOpened) : 0;
    const bTime = b.lastOpened ? Date.parse(b.lastOpened) : 0;
    return bTime - aTime;
  });

  return await addStarFlag(items, userId);
};

// Returns folders that can be used as move targets
// Only folders: 
// - owned by user
// - not in bin
// - under given parentId (or root if null)
const getMoveFolders = async (userId, parentId = null) => {
  let candidates;

  if (parentId === null) {
    // Root level: only owned folders in root
    const rootItems = await filesRepository.getFilesInRootForUser(userId);

    candidates = rootItems.filter(
      item => item.type === 'folder'
    );
  } else {
    const parent = await filesRepository.getFileById(parentId);


    if (!parent) return 'PARENT_NOT_FOUND';
    if (parent.type !== 'folder') return 'INVALID_PARENT';
    if (String(parent.ownerId) !== String(userId)) return 'NO_PERMISSION';

    // Only owner can browse move targets
    const children = await filesRepository.getChildren(parentId);

    candidates = children.filter(
      item => item.type === 'folder'
    );
  }

  const visible = [];
  for (const folder of candidates) {
    if (!(await binService.isItemOrAncestorInBin(userId, folder.id))) {
      visible.push(folder);
    }
  }

  // Minimal shape for UI
  return visible.map(folder => ({
    id: folder.id,
    name: folder.name,
  }));
};

//Returns file/folder metadata by ID
//only if the user has access (owner or shared)
const getFileById = async(id, userId) => {
  const file = await filesRepository.getFileById(id);

  if (!file) {
    return { status: 'NOT_FOUND' };
  }
  if (
      await binService.isItemOrAncestorInBin(userId, file.id) ||
      !(await canUserAccessFile(userId, file, 'get'))
    ) {
      return { status: 'FORBIDDEN' };
  }
  return { status: 'OK', file: await addStarToItem(file, userId) };
};


// GET /api/files/:id
// file: metadata + content
// folder: metadata + children names and types
const getFileByIdWithContent = async (id, userId) => {
  // 1. Reuse metadata + permission logic
  const metaResult = await getFileById(id, userId);
  if (metaResult.status !== 'OK') {
    return metaResult;
  }

  const nowIso = new Date().toISOString();
  const userLastOpened = recentStore.touch(userId, id, nowIso);
  const fileWithUserTime = { ...metaResult.file, lastOpened: userLastOpened };
  const file = await addStarToItem(fileWithUserTime, userId);

  // 2. Folder → return children names
  if (file.type === 'folder') {
    if (await binService.isItemOrAncestorInBin(userId, file.id)) {
    return {
      status: 'OK',
      file: {
        ...(await addStarToItem(file, userId)),
        children: [] // if folder is in bin, its children are not accessible
      }
    };
  }
    const children = await filesRepository.getChildren(file.id);
    const childrenWithStar = await Promise.all(
      children.map(child => addStarToItem(child, userId))
    );

    const childrenWithOwner = await Promise.all(
      childrenWithStar.map(async child => {
        const owner = await userService.getUserById(child.ownerId);
        const ownerName = owner?.displayName || 'Unknown';
        const ownerEmail = owner?.email || '';
        const ownerImage = owner?.image || null;
        const ownerLabel =
          String(child.ownerId) === String(userId) ? 'me' : ownerName;

        return {
          id: child.id,
          name: child.name,
          type: child.type,
          isStarred: child.isStarred,
          contentType: child.contentType,
          lastOpened: recentStore.getLastOpened(userId, child.id),
          ownerId: child.ownerId,
          ownerName,
          ownerEmail,
          ownerImage,
          ownerLabel,
          createdAt: child.createdAt
        };
      })
    );

    return {
      status: 'OK',
      file: {
        ...(await addStarToItem(file, userId)),
        children: childrenWithOwner
      }
    };
  }

  // 3. File → fetch content from C++
  if (file.type === 'file') {
    let raw;
    try {
      raw = await cppClientService.getFileContent(file.id); // MUST be Buffer
    } catch (e) {
      console.error('[filesService] C++ GET communication failure:', e?.message);
      return { status: 'CPP_ERROR' };
    }

    const parsed = parseCppGetResponse(raw);

    if (!parsed || parsed.ok === false) {
      console.error('[filesService] C++ GET parse failure:', parsed?.error);
      return { status: 'CPP_ERROR' };
    }

    const body = parsed.rawBody; // Buffer
    const contentType = detectContentTypeFromBuffer(body);

    return {
      status: 'OK',
      file: {
        ...(await addStarToItem(file, userId)),
        contentType,
        content:
          contentType === 'image'
            ? body.toString('base64')
            : body.toString('utf8')
      }
    };
  }

  // 4. Safety fallback (should not happen)
  return { status: 'NOT_FOUND' };
};


//Helper to compute fullPath of new item
const computeFullPath = (name, parent) => {
  if (!parent) {
    return `/${name}`;
  }
  return `${parent.fullPath}/${name}`;
};

//Creates a new file or folder
//with proper permission checks
const createFile = async (userId, name, type, parentId = null, content = '') => {
  const id = generateId();
  let item;
  let parent = null;
  const nowIso = new Date().toISOString();

  if (parentId !== null) {
    parent = await filesRepository.getFileById(parentId);

    if (!parent) {
      return 'PARENT_NOT_FOUND';
    }

    if (parent.type !== 'folder') {
      return 'INVALID_PARENT';
    }

    if (!await canUserAccessFile(userId, parent, 'post')) {
      return 'NO_PERMISSION';
    }
  }

  const fullPath = computeFullPath(name, parent);

  try {
    item = FileSystemItemFactory.create(
      type,
      id,
      name,
      userId,
      parentId,
      fullPath,
      nowIso,
      nowIso
    );
  } catch {
    return 'INVALID_TYPE';
  }

  if (item.type === 'file') {
    try {
      const payload = normalizeContentForCpp(content ?? '');
      item.contentType = deriveContentTypeFromContent(content ?? '');
      const ok = await cppClientService.createFile(id, payload);
      if (!ok) {
        return 'CPP_ERROR';
      }
    } catch (e) {
      console.error('[filesService] C++ createFile failure:', e.message);
      return 'CPP_ERROR';
    }
  }

  await filesRepository.saveFile(item);
  // Record creator's recent entry so it shows up for them
  recentStore.touch(userId, id, nowIso);
  return { status: 'OK', file: item };
};

// filesService.js
const getFilesByParent = async (userId, parentId) => {
  const parent = await filesRepository.getFileById(parentId);
  if (!parent) return 'PARENT_NOT_FOUND';
  if (parent.type !== 'folder') return 'INVALID_PARENT';
  if (!(await canUserAccessFile(userId, parent, 'get'))) return 'NO_PERMISSION';

  const children = await filesRepository.getChildren(parentId);

  const visible = [];
  for (const item of children) {
    if (!(await binService.isItemOrAncestorInBin(userId, item.id))) {
      visible.push(item);
    }
  }

  return await addStarFlag(sortByCreatedDesc(visible), userId);
};

const getChildrenForUser = async (userId, parentId) => {
  const parent = await filesRepository.getFileById(parentId);
  if (!parent) return 'NOT_FOUND';

  if (!await canUserAccessFile(userId, parent, 'get')) {
    return 'FORBIDDEN';
  }

  const children = await filesRepository.getChildren(parentId);

  const visible = [];
  for (const child of children) {
    if (!(await binService.isItemOrAncestorInBin(userId, child.id))) {
      visible.push(child);
    }
  }

  return await addStarFlag(visible, userId);
};

//updates file/folder metadata name by ID
//Business logic layer: delegates update to repository.
const updateFileNameById = async (id, userId, newName) => {
  const file = await filesRepository.getFileById(id);

  if (!file) {
    return 'NOT_FOUND';
  }

  if (!await canUserAccessFile(userId, file, 'patch')) {
    return 'NO_PERMISSION';
  }

  await filesRepository.updateFileNameById(id, newName);
  return 'OK';
};


//Updates file content (physical file only, metadata unchanged).
//Recreate physical file with same id and new content
const updateFileContent = async (id, userId, content) => {
  const item = await filesRepository.getFileById(id);
  if (!item) {
    return 'NOT_FOUND';
  }

  if (!await canUserAccessFile(userId, item, 'patch')) {
    return 'NO_PERMISSION';
  }

  if (item.type !== 'file') {
    return 'NOT_A_FILE';
  }

  try {
    const deleted = await cppClientService.deleteFile(id);
    if (!deleted) {
      return 'CPP_ERROR';
    }

    const payload = normalizeContentForCpp(content);
    const created = await cppClientService.createFile(id, payload);
    if (!created) {
      return 'CPP_ERROR';
    }

    item.contentType = deriveContentTypeFromContent(content);
    return 'OK';
  } catch (e) {
    console.error('[filesService] C++ updateFileContent failure:', e && e.message ? e.message : e);
    return 'CPP_ERROR';
  }
};

// Replace file content with binary buffer (images)
const replaceFileContent = async (id, userId, buffer) => {
  const item = await filesRepository.getFileById(id);
  if (!item) return 'NOT_FOUND';

  if (!await canUserAccessFile(userId, item, 'patch')) {
    return 'NO_PERMISSION';
  }

  if (item.type !== 'file') {
    return 'NOT_A_FILE';
  }

  try {
    const deleted = await cppClientService.deleteFile(id);
    if (!deleted) return 'CPP_ERROR';

    const created = await cppClientService.createFile(id, buffer);
    if (!created) return 'CPP_ERROR';

    item.contentType = 'image';
    return 'OK';
  } catch (e) {
    console.error('[filesService] replaceFileContent failed:', e.message);
    return 'CPP_ERROR';
  }
};


// Deletes a file or folder by ID.
// Requires DELETE permission (owner or ADMIN)
// - Item must be in the user's bin
// - Non-owner delete: removes ONLY the user's permissions
// - Owner delete: deletes item globally (including permissions + storage)
const deleteFileById = async (fileId, userId) => {
  const item = await filesRepository.getFileById(fileId);
  if (!item) {
    return 'NOT_FOUND';
  }

  const isOwner = String(item.ownerId) === String(userId);

  if (
  (isOwner && !await binService.isInGlobalBin(fileId)) ||
  (!isOwner && !await binService.isInUserBin(userId, fileId))
  ) {
  return 'FORBIDDEN';
  }
  // Must have delete permission
  if (!await canUserAccessFile(userId, item, 'delete')) {
    return 'NO_PERMISSION';
  }
  
  // NON-OWNER: local delete only
  if (String(item.ownerId) !== String(userId)) {
    // Remove only this user's permissions
    await permissionService.deletePermissionByUserAndFile(userId, fileId);

    // Remove from this user's bin
    await binService.restoreFromUserBin(userId, fileId);

    return 'OK';
  }

  // OWNER: global delete
  try {
    await deleteRecursively(item);

    // Remove permissions for everyone
    await permissionService.deletePermissionsForFile(fileId);
    
    // Remove from all users' bins
    await binService.removeEverywhere(fileId);

    return 'OK';
  } catch (e) {
    console.error('[filesService] Recursive delete failed:', e.message);
    return 'CPP_ERROR';
  }
};

// Recursively deletes a file or folder and all of its descendants.
const deleteRecursively = async (item) => {
  if (item.type === 'folder') {
    const children = await filesRepository.getChildren(item.id);
    for (const child of children) {
      await deleteRecursively(child);
    }
  }

  if (item.type === 'file') {
    try {
      const ok = await cppClientService.deleteFile(item.id);
      if (!ok) {
        throw new Error('CPP_DELETE_FAILED');
      }
    } catch {
      throw new Error('CPP_DELETE_COMMUNICATION_FAILED');
    }
  }

  await filesRepository.deleteItemById(item.id);
};


// Searches file metadata by query string (user-specific).
// Combines name search (in-memory) + content search (C++ SEARCH).
const searchFiles = async (query, userId) => {
  const normalizedQuery = String(query || '').toLowerCase();
  const byName = await filesRepository.searchByName(query);

  const visibleByName = [];
  for (const file of byName) {
    if (
      await canUserAccessFile(userId, file, 'search') &&
      !(await binService.isItemOrAncestorInBin(userId, file.id))
    ) {
      visibleByName.push(file);
    }
  }
  let parsed;
  try {
    const raw = await cppClientService.searchFile(String(query));
    parsed = parseCppSearchResponse(raw);
  } catch (e) {
    console.error('[filesService] C++ search communication failure:', e?.message);
    return null;
  }

  if (parsed && parsed.ok === false) {
    return parsed;
  }

  const contentIds = (parsed && parsed.ids) ? parsed.ids : [];
  const byContent = [];

  for (const id of contentIds) {
    const fileMeta = await filesRepository.getFileById(id);
    if (!fileMeta) continue;

    if (!await canUserAccessFile(userId, fileMeta, 'search')) continue;
    if (fileMeta.type !== 'file') continue;
    if (fileMeta.contentType === 'image') {
      const name = (fileMeta.name || '').toLowerCase();
      if (!name.includes(normalizedQuery)) continue;
    }

    // False-positive protection: if query appears in id, verify actual bytes contain query as text
    if (id.includes(query)) {
      let rawGet;
      try {
        rawGet = await cppClientService.getFileContent(id);
      } catch {
        return null;
      }

      const parsedGet = parseCppGetResponse(rawGet);
      if (!parsedGet || parsedGet.ok === false) {
        return null;
      }

      const bodyBuf = parsedGet.rawBody;
      const contentType = detectContentTypeFromBuffer(bodyBuf);

      // Only do "includes" for text files. For images, cannot validate text presence safely.
      if (contentType === 'text') {
        const text = bodyBuf.toString('utf8');
        if (await binService.isItemOrAncestorInBin(userId, fileMeta.id)) continue;
        if (text.includes(query)) {
          byContent.push(fileMeta);
        }
      } else {
        // If it's an image and it matched, we cannot validate "content includes query"
        // so we ignore it to avoid false positives
      }
    } else {
      byContent.push(fileMeta);
    }
  }

  const map = new Map();
  for (const item of [...visibleByName, ...byContent]) {
    map.set(item.id, item);
  }

  return await addStarFlag(sortByCreatedDesc(Array.from(map.values())), userId);
};


// Parse raw response from C++ SearchFileCommand
function parseCppSearchResponse(raw) {
  if (!raw) return { ok: true, ids: [] };

  const text = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);

  if (text.startsWith('400')) {
    return { ok: false, status: 400, error: 'Malformed query' };
  }

  if (text.startsWith('500')) {
    return { ok: false, status: 502, error: 'C++ server error' };
  }

  if (!text.startsWith('200 Ok')) {
    return { ok: false, status: 502, error: 'Unexpected C++ response' };
  }

  const parts = text.split('\n\n');
  if (parts.length < 2) return { ok: true, ids: [] };

  const line = parts[1].trim();
  if (!line) return { ok: true, ids: [] };

  return { ok: true, ids: line.split(' ').filter(Boolean) };
}

// Detect content type by magic bytes (images vs text)
function detectContentTypeFromBuffer(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 4) return 'text';

  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return 'image';
  }

  // JPG: FF D8 FF
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
    return 'image';
  }

  // GIF: 47 49 46 38
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    return 'image';
  }

  return 'text';
}

// Parse raw response from C++ GetFileCommand
function parseCppGetResponse(rawBuffer) {
  if (!rawBuffer || !Buffer.isBuffer(rawBuffer)) {
    return {
      ok: false,
      status: 502,
      error: 'Invalid C++ response'
    };
  }

  const sep = Buffer.from('\n\n');
  const idx = rawBuffer.indexOf(sep);

  if (idx === -1) {
    return {
      ok: false,
      status: 502,
      error: 'Malformed C++ response'
    };
  }

  const header = rawBuffer.slice(0, idx).toString('utf8');
  const body = rawBuffer.slice(idx + sep.length);

  if (header.startsWith('400')) {
    return { ok: false, status: 400, error: 'Bad GET request' };
  }

  if (header.startsWith('404')) {
    return { ok: false, status: 404, error: 'File not found' };
  }

  if (header.startsWith('500')) {
    return { ok: false, status: 502, error: 'C++ server error' };
  }

  if (!header.startsWith('200')) {
    return { ok: false, status: 502, error: 'Unexpected C++ response' };
  }

  return {
    ok: true,
    rawBody: body
  };
}


// Toggles starred state of a file or folder
const toggleFileStar = async (id, userId) => {
  const item = await filesRepository.getFileById(id);

  if (!item) {
    return 'NOT_FOUND';
  }

  if (!await canUserAccessFile(userId, item, 'get')) {
    return 'NO_PERMISSION';
  }

  const starred = await starService.toggle(userId, id);
  return { status: 'OK', isStarred: starred };
};

// ===== Helpers for per-user star flag =====
async function addStarFlag(items, userId) {
  return Promise.all(items.map(item => addStarToItem(item, userId)));
}
// Add isStarred flag to a single item if isn't hidden by bin
async function addStarToItem(item, userId) {
  const isHiddenByBin = await binService.isItemOrAncestorInBin(userId, item.id);
  const isStarred = await starService.isStarred(userId, item.id);

  return {
    ...item,
    isStarred:
      isStarred && !isHiddenByBin
  };
}

const moveToBin = async (id, userId) => {
  const item = await filesRepository.getFileById(id);
  if (!item) return 'NOT_FOUND';

  // to move to bin, user must have get permission (either owner or shared)
  if (!await canUserAccessFile(userId, item, 'get')) {
    return 'NO_PERMISSION';
  }

  // if owner → move to global bin (hidden from everyone)
  if (String(item.ownerId) === String(userId)) {
    await binService.addToGlobalBin(id, item.parentId);
  } else {
    // non-owner → mask only for that user
    await binService.moveToUserBin(userId, id, item.parentId);
  }

  return 'OK';
};

const restoreFromBin = async (id, userId) => {
  const item = await filesRepository.getFileById(id);
  if (!item) return 'NOT_FOUND';
  // to restore from bin, user must have get permission (either owner or shared)
  if (!await canUserAccessFile(userId, item, 'get')) {
    return 'NO_PERMISSION';
  }
  // if owner → restore from global bin (for all users)
  if (String(item.ownerId) === String(userId)) {
    await binService.removeFromGlobalBin(id);
  } else {
    // non-owner → restore only for that user
    await binService.restoreFromUserBin(userId, id);
  }
  return 'OK';
};

// Get all items in bin for user (not including those whose ancestors are also in bin)
// in bin we show only the items that were directly moved to bin, not their children.
// we don't show files that the owner moved to bin for everyone.
const getBinForUser = async (userId) => {
  const items = [];

  // user-specific bin
  const userBinIds = await binService.getBinIds(userId);
  for (const id of userBinIds) {
    const item = await filesRepository.getFileById(id);
    if (!item) continue;

    if (!await canUserAccessFile(userId, item, 'get')) continue;
    items.push(item);
  }

  // global bin — ONLY for owner
  const globalBinIds = await binService.getGlobalBinIds();
  for (const id of globalBinIds) {
    const item = await filesRepository.getFileById(id);
    if (!item) continue;

    if (String(item.ownerId) !== String(userId)) continue;
    items.push(item);
  }

  return await addStarFlag(sortByCreatedDesc(items), userId);
};


// Check if possibleDescendantId is a descendant of ancestorId
const isDescendant = async (ancestorId, possibleDescendantId) => {
  let current = possibleDescendantId;
  const visited = new Set();

  // Traverse up the tree from possibleDescendantId to see if we reach ancestorId
  while (current) {
    if (current === ancestorId) return true;
    if (visited.has(current)) return false;
    visited.add(current);

    const item = await filesRepository.getFileById(current);
    if (!item) return false;
    current = item.parentId;
  }

  return false;
};

const moveItem = async (userId, sourceId, targetParentId) => {
  const source = await filesRepository.getFileById(sourceId);
  if (!source) return 'NOT_FOUND';

  // Only owner can move
  if (String(source.ownerId) !== String(userId)) {
    return 'NO_PERMISSION';
  }

  // Cannot move items that are in bin
  if (await binService.isItemOrAncestorInBin(userId, sourceId)) {
    return 'IN_BIN';
  }

  let targetParent = null;

  if (targetParentId !== null) {
    targetParent = await filesRepository.getFileById(targetParentId);

    if (!targetParent) return 'TARGET_NOT_FOUND';
    if (targetParent.type !== 'folder') return 'INVALID_TARGET';

    // Target must be owned by user
    if (String(targetParent.ownerId) !== String(userId)) {
      return 'NO_PERMISSION';
    }

    // Cannot move into bin
    if (await binService.isItemOrAncestorInBin(userId, targetParentId)) {
      return 'TARGET_IN_BIN';
    }

    // Prevent cycles
    if (source.type === 'folder' &&
        isDescendant(source.id, targetParentId)) {
      return 'CYCLE';
    }
  }

  // No-op
  if (source.parentId === targetParentId) {
    return 'OK';
  }

  await filesRepository.updateParentById(sourceId, targetParentId);
  return 'OK';
};


module.exports = {
  canUserAccessFile,
  getFilesInRootForUser,
  getSharedWithUser,
  getStarredForUser,
  getRecentFiles,
  getFileById,
  getFileByIdWithContent,
  createFile,
  getFilesByParent, 
  getChildrenForUser,
  updateFileNameById,
  updateFileContent,
  replaceFileContent,
  deleteFileById,
  searchFiles,
  toggleFileStar,
  moveToBin,
  restoreFromBin,
  getBinForUser,
  isDescendant,
  moveItem,
  getMoveFolders
};
