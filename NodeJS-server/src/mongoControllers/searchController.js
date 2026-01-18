const filesService = require('../services/filesService');
const { attachOwnerInfo } = require('../mongoServices/ownerInfoService');

async function searchFiles(req, res) {
  const userId = req.userId;
  const { query } = req.params;

  if (query === undefined) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const q = String(query);

  // Block only characters that can break the TCP line protocol
  if (/[\r\n\0]/.test(q)) {
    return res.status(400).json({ error: 'Malformed query' });
  }

  const results = await filesService.searchFiles(q, userId);

  if (results === null) {
    return res.status(503).json({ error: 'C++ server unreachable' });
  }

  if (results && results.ok === false) {
    return res.status(results.status).json({ error: results.error });
  }

  return res.status(200).json(await attachOwnerInfo(results, userId));
}

module.exports = { searchFiles };
