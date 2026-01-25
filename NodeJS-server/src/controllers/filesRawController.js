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

  const rawName = String(file.name || 'download');
  const mimeType =
    detectMimeFromName(rawName) ||
    (file.contentType === 'text' ? 'text/plain' : null) ||
    detectImageMime(body) ||
    'application/octet-stream';
  const finalName = ensureNameHasExtension(rawName, mimeType);
  const safeName = finalName.replace(/[\\/:*?"<>|]/g, '_');

  res.status(200);
  res.setHeader('Content-Type', mimeType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(finalName)}`
  );
  res.send(body);
};

const getRawUrl = async (req, res) => {
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

  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
  if (!token) {
    return res.status(401).send('token required');
  }

  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const baseUrl = `${proto}://${host}`;
  const url = `${baseUrl}/api/files/${fileId}/raw?token=${encodeURIComponent(token)}`;

  return res.json({ url });
};

module.exports = {
  getRawFile,
  getRawUrl,
};

function detectMimeFromName(name) {
  const lower = String(name || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.txt')) return 'text/plain';
  return null;
}

function detectImageMime(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 4) return null;

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

  return null;
}

function ensureNameHasExtension(name, mimeType) {
  if (/\.[A-Za-z0-9]+$/.test(name)) {
    return name;
  }
  const ext = extensionForMime(mimeType);
  return ext ? `${name}.${ext}` : name;
}

function extensionForMime(mimeType) {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/gif':
      return 'gif';
    case 'application/pdf':
      return 'pdf';
    case 'text/plain':
      return 'txt';
    default:
      return null;
  }
}
