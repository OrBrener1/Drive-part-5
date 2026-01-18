const filesRepository = require('../mongoRepository/mongoFileRepository');
const binRepository = require('../mongoRepository/binRepository');

async function addToGlobalBin(fileId, originalParentId = null) {
  return binRepository.addToGlobalBin(fileId, originalParentId);
}

async function removeFromGlobalBin(fileId) {
  return binRepository.removeFromGlobalBin(fileId);
}

async function isInGlobalBin(fileId) {
  return binRepository.isInGlobalBin(fileId);
}

async function moveToUserBin(userId, fileId, originalParentId = null) {
  return binRepository.moveToUserBin(userId, fileId, originalParentId);
}

async function restoreFromUserBin(userId, fileId) {
  return binRepository.restoreFromUserBin(userId, fileId);
}

async function isInUserBin(userId, fileId) {
  return binRepository.isInUserBin(userId, fileId);
}

async function getBinIds(userId) {
  return binRepository.getUserBinIds(userId);
}

async function getGlobalBinIds() {
  return binRepository.getGlobalBinIds();
}

async function removeEverywhere(fileId) {
  return binRepository.removeEverywhere(fileId);
}

async function isItemOrAncestorInBin(userId, fileId) {
  let currentId = fileId;

  while (currentId) {
    if (
      await binRepository.isInGlobalBin(currentId) ||
      await binRepository.isInUserBin(userId, currentId)
    ) {
      return true;
    }

    const item = await filesRepository.getFileById(currentId);
    if (!item) return false;

    currentId = item.parentId;
  }

  return false;
}

module.exports = {
  addToGlobalBin,
  removeFromGlobalBin,
  isInGlobalBin,
  moveToUserBin,
  restoreFromUserBin,
  isInUserBin,
  getBinIds,
  getGlobalBinIds,
  removeEverywhere,
  isItemOrAncestorInBin
};
