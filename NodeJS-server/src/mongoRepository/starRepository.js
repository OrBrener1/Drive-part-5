const mongoose = require('mongoose');
const Star = require('../mongoModels/starModel');

function toObjectId(id) {
  if (id == null) return null;
  return id instanceof mongoose.Types.ObjectId
    ? id
    : new mongoose.Types.ObjectId(id);
}

async function addStar(userId, fileId) {
  const userObjectId = toObjectId(userId);
  return Star.findOneAndUpdate(
    { userId: userObjectId, fileId },
    { userId: userObjectId, fileId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

async function removeStar(userId, fileId) {
  return Star.deleteOne({
    userId: toObjectId(userId),
    fileId
  });
}

async function isStarred(userId, fileId) {
  const doc = await Star.findOne({
    userId: toObjectId(userId),
    fileId
  }).lean();

  return Boolean(doc);
}

async function getStarredIds(userId) {
  const docs = await Star.find({
    userId: toObjectId(userId)
  }).select('fileId').lean();

  return docs.map(doc => doc.fileId);
}

async function deleteStarsForFile(fileId) {
  return Star.deleteMany({ fileId });
}

module.exports = {
  addStar,
  removeStar,
  isStarred,
  getStarredIds,
  deleteStarsForFile
};
