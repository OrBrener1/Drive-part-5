const starRepository = require('../mongoRepository/starRepository');

async function toggle(userId, fileId) {
  const starred = await starRepository.isStarred(userId, fileId);

  if (starred) {
    await starRepository.removeStar(userId, fileId);
    return false;
  }

  await starRepository.addStar(userId, fileId);
  return true;
}

async function isStarred(userId, fileId) {
  return starRepository.isStarred(userId, fileId);
}

async function getStarredIds(userId) {
  return starRepository.getStarredIds(userId);
}

async function deleteStarsForFile(fileId) {
  return starRepository.deleteStarsForFile(fileId);
}

module.exports = {
  toggle,
  isStarred,
  getStarredIds,
  deleteStarsForFile
};
