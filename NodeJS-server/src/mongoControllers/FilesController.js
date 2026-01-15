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
};
