const filesRepository = require('../mongoRepository/mongoFileRepository');
const cppClientService = require('../services/cppClientService');
const permissionStore = require('../services/permissionStore');

// reuse same permission logic style
function canUserAccessFile(userId, file) {
  if (!file) return false;
  if (file.ownerId === userId) return true;
  return permissionStore.hasPermission(userId, file.id, 'get');
}

const getRawFile = async (req, res) => {
  const userId = req.userId;
  const fileId = req.params.id;

  const file = await filesRepository.getFileById(fileId);
  if (!file) {
    return res.status(404).send('File not found');
  }

  if (!canUserAccessFile(userId, file)) {
    return res.status(403).send('Forbidden');
  }

  if (file.type !== 'file') {
    return res.status(400).send('Not a file');
  }

  let raw;
  try {
    raw = await cppClientService.getFileContent(file.id);
  } catch (e) {
    console.error('[filesRawController] C++ GET failure:', e.message);
    return res.status(503).send('File server unavailable');
  }

  // raw is Buffer that contains headers + body → parse like before
  const sep = Buffer.from('\n\n');
  const idx = raw.indexOf(sep);
  if (idx === -1) {
    return res.status(502).send('Malformed C++ response');
  }

  const body = raw.slice(idx + sep.length);

  res.status(200);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(body);
};

module.exports = {
  getRawFile,
};
