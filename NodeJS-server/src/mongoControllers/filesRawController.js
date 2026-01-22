const filesRepository = require('../mongoRepository/mongoFileRepository');
const cppClientService = require('../services/cppClientService');
const permissionService = require('../mongoServices/permissionService');

// reuse same permission logic style
async function canUserAccessFile(userId, file) {
  if (!file) return false;
  if (String(file.ownerId) === String(userId)) return true;
  return permissionService.hasPermission(userId, file.id, 'get');
}

const getRawFile = async (req, res) => {
  const userId = req.userId;
  const fileId = req.params.id;

  const file = await filesRepository.getFileById(fileId);
  if (!file) {
    return res.status(404).send('File not found');
  }

  if (!await canUserAccessFile(userId, file)) {
    return res.status(403).send('Forbidden');
  }

  if (file.type !== 'file' && file.type !== 'image') {
    return res.status(400).send('Not a binary file');
  }

  let raw;
  try {
    raw = await cppClientService.getFileContent(file.id);
  } catch (e) {
    console.error('[filesRawController] C++ GET failure:', e.message);
    return res.status(503).send('File server unavailable');
  }

  // raw is Buffer that contains headers + body -> parse like before
  const sep = Buffer.from('\n\n');
  const idx = raw.indexOf(sep);
  if (idx === -1) {
    return res.status(502).send('Malformed C++ response');
  }

  const body = raw.slice(idx + sep.length);

  const mimeType =
    file.contentType === 'image'
      ? detectImageMime(body)
      : 'application/octet-stream';
  
  res.writeHead(200, {
  'Content-Type': mimeType,
  'Content-Length': body.length,
  });
  res.end(body);

};

function detectImageMime(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 4) return 'image/png';

  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return 'image/png';
  }

  // JPG
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
    return 'image/jpeg';
  }

  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    return 'image/gif';
  }

  return 'image/png';
}

module.exports = {
  getRawFile,
};
