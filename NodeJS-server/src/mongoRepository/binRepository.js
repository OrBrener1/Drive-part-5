const mongoose = require('mongoose');
const Bin = require('../mongoModels/binModel');

function toObjectId(id) {
  if (id == null) return null;
  return id instanceof mongoose.Types.ObjectId
    ? id
    : new mongoose.Types.ObjectId(id);
}

async function addToGlobalBin(fileId, originalParentId = null) {
  return Bin.findOneAndUpdate(
    { fileId, scope: 'global' },
    { fileId, scope: 'global', userId: null, originalParentId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

async function removeFromGlobalBin(fileId) {
  return Bin.deleteOne({ fileId, scope: 'global' });
}

async function isInGlobalBin(fileId) {
  const doc = await Bin.findOne({ fileId, scope: 'global' }).lean();
  return Boolean(doc);
}

async function moveToUserBin(userId, fileId, originalParentId = null) {
  const userObjectId = toObjectId(userId);
  return Bin.findOneAndUpdate(
    { fileId, scope: 'user', userId: userObjectId },
    { fileId, scope: 'user', userId: userObjectId, originalParentId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

async function restoreFromUserBin(userId, fileId) {
  return Bin.deleteOne({
    fileId,
    scope: 'user',
    userId: toObjectId(userId)
  });
}

async function isInUserBin(userId, fileId) {
  const doc = await Bin.findOne({
    fileId,
    scope: 'user',
    userId: toObjectId(userId)
  }).lean();

  return Boolean(doc);
}

async function getUserBinIds(userId) {
  const docs = await Bin.find({
    scope: 'user',
    userId: toObjectId(userId)
  }).select('fileId').lean();

  return docs.map(doc => doc.fileId);
}

async function getGlobalBinIds() {
  const docs = await Bin.find({ scope: 'global' })
    .select('fileId')
    .lean();

  return docs.map(doc => doc.fileId);
}

async function removeEverywhere(fileId) {
  return Bin.deleteMany({ fileId });
}

module.exports = {
  addToGlobalBin,
  removeFromGlobalBin,
  isInGlobalBin,
  moveToUserBin,
  restoreFromUserBin,
  isInUserBin,
  getUserBinIds,
  getGlobalBinIds,
  removeEverywhere
};
