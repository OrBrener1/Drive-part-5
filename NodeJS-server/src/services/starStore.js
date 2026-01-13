// In-memory per-user star store.
// Maps userId -> Set of fileIds starred by that user.
const starredByUser = new Map();

function ensureSet(userId) {
  if (!starredByUser.has(userId)) {
    starredByUser.set(userId, new Set());
  }
  return starredByUser.get(userId);
}

// Toggle star for a given user+file. Returns the new starred state (true if now starred).
function toggle(userId, fileId) {
  const set = ensureSet(userId);
  if (set.has(fileId)) {
    set.delete(fileId);
    return false;
  }
  set.add(fileId);
  return true;
}

function isStarred(userId, fileId) {
  const set = starredByUser.get(userId);
  return set ? set.has(fileId) : false;
}

function getStarredIds(userId) {
  const set = starredByUser.get(userId);
  return set ? Array.from(set) : [];
}

module.exports = {
  toggle,
  isStarred,
  getStarredIds
};
