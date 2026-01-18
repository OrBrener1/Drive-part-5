const filesService = require('../services/filesService');
const { attachOwnerInfo } = require('../services/ownerInfoService');

// validate file id format
function isValidFileId(id) {
  return typeof id === 'string' && /^f_\d+_\d+$/.test(id);
}

// GET /api/files
const getFilesInRootForUser = async (req, res) => {
  const userId = req.userId;
  const { starred } = req.query || {};

  if (starred === 'true') {
    const files = await filesService.getStarredForUser(userId);
    return res.status(200).json(attachOwnerInfo(files, userId));
  }

  const files = await filesService.getFilesInRootForUser(userId);
  return res.status(200).json(attachOwnerInfo(files, userId));
};

// GET /api/files/shared
const getSharedWithMe = async (req, res) => {
  const userId = req.userId;
  const files = await filesService.getSharedWithUser(userId);
  return res.status(200).json(attachOwnerInfo(files, userId));
};

// GET /api/files/recent
const getRecentFiles = async (req, res) => {
  const userId = req.userId;
  const files = await filesService.getRecentFiles(userId);
  return res.status(200).json(attachOwnerInfo(files, userId));
};

// GET /api/folders
const getMoveFolders = async (req, res) => {
  const userId = req.userId;
  const { parentId = null } = req.query;

  if (parentId !== null && !isValidFileId(parentId)) {
    return res.status(400).json({ error: 'Invalid parent id' });
  }

  const result = await filesService.getMoveFolders(userId, parentId);

  if (result === 'PARENT_NOT_FOUND') {
    return res.status(404).json({ error: 'Parent not found' });
  }
  if (result === 'INVALID_PARENT') {
    return res.status(400).json({ error: 'Invalid parent' });
  }
  if (result === 'NO_PERMISSION') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.status(200).json(result);
};

// GET /api/files/:id
const getFileById = async (req, res) => {
  const userId = req.userId;
  const fileId = req.params.id;

  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }

  const result = await filesService.getFileByIdWithContent(fileId, userId);

  switch (result.status) {
    case 'NOT_FOUND':
      return res.status(404).json({ error: 'File not found' });
    case 'FORBIDDEN':
      return res.status(403).json({ error: 'Forbidden' });
    case 'CPP_ERROR':
      return res.status(503).json({ error: 'File server unavailable' });
    case 'OK':
      return res.status(200).json(result.file);
    default:
      return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/files/bin
const getBin = async (req, res) => {
  const userId = req.userId;

  try {
    const items = await filesService.getTrashForUser(userId);
    return res.status(200).json(attachOwnerInfo(items, userId));
  } catch (err) {
    console.error('Failed to fetch bin items:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// POST /api/files
const createFile = async (req, res) => {
  const userId = req.userId;
  const { name, type, parentId, content } = req.body || {};

  if (!name || !type) {
    return res.status(400).json({ error: 'Missing name or type' });
  }

  const result = await filesService.createFile(
    userId,
    name,
    type,
    parentId,
    content
  );

  if (typeof result === 'string') {
    const map = {
      PARENT_NOT_FOUND: 404,
      INVALID_PARENT: 400,
      NO_PERMISSION: 403,
      INVALID_TYPE: 400,
      CPP_ERROR: 503,
    };
    return res.status(map[result] || 500).json({ error: result });
  }

  return res.status(201).json(result.file);
};

// POST /api/files/:id/move
const moveFile = async (req, res) => {
  const userId = req.userId;
  const fileId = req.params.id;
  const { targetParentId } = req.body || {};

  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }

  if (targetParentId !== null && !isValidFileId(targetParentId)) {
    return res.status(400).json({ error: 'Invalid target parent id' });
  }

  const result = await filesService.moveItem(userId, fileId, targetParentId ?? null);

  switch (result) {
    case 'NOT_FOUND':
    case 'TARGET_NOT_FOUND':
      return res.status(404).json({ error: 'Item not found' });

    case 'NO_PERMISSION':
      return res.status(403).json({ error: 'Forbidden' });

    case 'IN_BIN':
    case 'TARGET_IN_BIN':
      return res.status(400).json({ error: 'Cannot move items in bin' });

    case 'INVALID_TARGET':
      return res.status(400).json({ error: 'Invalid target folder' });

    case 'CYCLE':
      return res.status(400).json({ error: 'Cannot move folder into its descendant' });

    case 'OK':
      return res.status(204).send();

    default:
      return res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/files/:id
const updateFileById = async (req, res) => {
  const userId = req.userId;
  const fileId = req.params.id;
  const { name, content } = req.body || {};

  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }

  if (name !== undefined) {
    const r = await filesService.updateFileNameById(fileId, userId, name);
    if (r !== 'OK') return res.status(r === 'NOT_FOUND' ? 404 : 403).end();
  }

  if (content !== undefined) {
    const r = await filesService.updateFileContent(fileId, userId, content);
    if (r !== 'OK') {
      const map = {
        NOT_FOUND: 404,
        NO_PERMISSION: 403,
        NOT_A_FILE: 400,
        CPP_ERROR: 503,
      };
      return res.status(map[r] || 500).end();
    }
  }

  return res.status(204).end();
};

// PATCH /api/files/:id/star
const toggleStar = async (req, res) => {
  const userId = req.userId;
  const itemId = req.params.id;

  if (!isValidFileId(itemId)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }

  const result = await filesService.toggleFileStar(itemId, userId);
  if (result === 'NOT_FOUND') {
    return res.status(404).json({ error: 'item not found' });
  }

  if (result === 'NO_PERMISSION') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (result.status === 'OK') {
    // Let the client know the new star status
    return res.status(200).json({ id: itemId, starred: result.isStarred });
  }

  return res.status(500).json({ error: 'Internal server error' });
};


// PATCH /api/files/:id/bin
const moveToBin = async (req, res) => {
  const userId = req.userId;
  const itemId = req.params.id;

  if (!isValidFileId(itemId)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }

  const result = await filesService.moveToBin(itemId, userId);

  if (result === 'NOT_FOUND') {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (result === 'NO_PERMISSION') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.status(204).send();
};

// PATCH /api/files/:id/restore
const restoreFromBin = async (req, res) => {
  const userId = req.userId;
  const itemId = req.params.id;

  if (!isValidFileId(itemId)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }

  const result = await filesService.restoreFromBin(itemId, userId);

  if (result === 'NOT_FOUND') {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (result === 'NO_PERMISSION') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.status(204).send();
};

// PUT /api/files/:id/replace
const replaceFileById = async (req, res) => {
  const userId = req.userId;
  const fileId = req.params.id;

  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: "Invalid file id" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Missing file" });
  }

  const buffer = req.file.buffer;

  const result = await filesService.replaceFileContent(
    fileId,
    userId,
    buffer,
  );

  switch (result) {
    case "NOT_FOUND":
      return res.status(404).json({ error: "File not found" });
    case "NO_PERMISSION":
      return res.status(403).json({ error: "Forbidden" });
    case "NOT_A_FILE":
      return res.status(400).json({ error: "Not a file" });
    case "CPP_ERROR":
      return res.status(500).json({ error: "File server unavailable" });
    case "OK":
      return res.status(204).send();
    default:
      return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/files/:id
const deleteFileById = async (req, res) => {
  const userId = req.userId;
  const fileId = req.params.id;

  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }

  const r = await filesService.deleteFileById(fileId, userId);
  if (r === 'NOT_FOUND') return res.status(404).end();
  if (r === 'FORBIDDEN') return res.status(403).end();
  if (r === 'CPP_ERROR') return res.status(503).end();

  return res.status(204).end();
};

module.exports = {
  getFilesInRootForUser,
  getSharedWithMe,
  getRecentFiles,
  getMoveFolders,
  getFileById,
  createFile,
  updateFileById,
  deleteFileById,
  toggleStar,
  getBin,
  moveToBin,
  restoreFromBin,
  moveFile,
  replaceFileById,
};
