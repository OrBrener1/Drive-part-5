// Service layer for access-deny rules.

const denyAccessRepository = require('../mongoRepository/denyAccessRepository');

async function addDeny(userId, fileId) {
  if (!userId || !fileId) {
    throw new Error('userId and fileId are required');
  }
  return denyAccessRepository.addDeny(userId, fileId);
}

async function removeDeny(userId, fileId) {
  if (!userId || !fileId) {
    throw new Error('userId and fileId are required');
  }
  return denyAccessRepository.removeDeny(userId, fileId);
}

async function hasDeny(userId, fileId) {
  if (!userId || !fileId) return false;
  return denyAccessRepository.hasDeny(userId, fileId);
}

async function deleteDeniesForFile(fileId) {
  if (!fileId) throw new Error('fileId is required');
  return denyAccessRepository.deleteDeniesForFile(fileId);
}

module.exports = {
  addDeny,
  removeDeny,
  hasDeny,
  deleteDeniesForFile
};
