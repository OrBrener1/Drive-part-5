const recentRepository = require('../mongoRepository/recentRepository');

const MAX_RECENTS = 20;

// Records a lastOpened timestamp for a given user+file.
// Returns the stored timestamp (ISO).
async function touch(userId, fileId, isoTimestamp) {
  const ts = isoTimestamp ? new Date(isoTimestamp) : new Date();

  await recentRepository.upsertRecent(userId, fileId, ts);
  await recentRepository.trimUserRecents(userId, MAX_RECENTS);

  return ts.toISOString();
}

// Returns the lastOpened timestamp for a given user+file, or undefined.
async function getLastOpened(userId, fileId) {
  const lastOpened = await recentRepository.getLastOpened(userId, fileId);
  if (!lastOpened) return undefined;
  return lastOpened instanceof Date ? lastOpened.toISOString() : lastOpened;
}

// Returns an array of { fileId, lastOpened } for a user (max 20).
async function getUserRecents(userId) {
  const recents = await recentRepository.getUserRecents(userId, MAX_RECENTS);
  return recents.map(({ fileId, lastOpened }) => ({
    fileId,
    lastOpened: lastOpened instanceof Date ? lastOpened.toISOString() : lastOpened
  }));
}

module.exports = {
  touch,
  getLastOpened,
  getUserRecents,
};
