// In-memory per-user store for lastOpened timestamps.
// Structure: Map<userId, Map<fileId, isoString>>
const userRecents = new Map();

// Records a lastOpened timestamp for a given user+file.
// Returns the stored timestamp.
function touch(userId, fileId, isoTimestamp) {
  const key = String(userId);
  let map = userRecents.get(key);
  if (!map) {
    map = new Map();
    userRecents.set(key, map);
  }
  const ts = isoTimestamp || new Date().toISOString();
  map.set(fileId, ts);
  return ts;
}

// Returns the lastOpened timestamp for a given user+file, or undefined.
function getLastOpened(userId, fileId) {
  const map = userRecents.get(String(userId));
  return map ? map.get(fileId) : undefined;
}

// Returns an array of { fileId, lastOpened } for a user.
function getUserRecents(userId) {
  const map = userRecents.get(String(userId));
  if (!map) return [];
  return Array.from(map.entries()).map(([fileId, lastOpened]) => ({
    fileId,
    lastOpened,
  }));
}

module.exports = {
  touch,
  getLastOpened,
  getUserRecents,
};
