const mongoose = require('mongoose');
const DenyAccess = require('../mongoModels/denyAccessModel');

function toObjectId(id) {
  if (id == null) return null;
  return id instanceof mongoose.Types.ObjectId
    ? id
    : new mongoose.Types.ObjectId(id);
}

async function addDeny(userId, fileId) {
  const userObjectId = toObjectId(userId);
  return DenyAccess.findOneAndUpdate(
    { userId: userObjectId, fileId },
    { userId: userObjectId, fileId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

async function removeDeny(userId, fileId) {
  return DenyAccess.deleteOne({
    userId: toObjectId(userId),
    fileId
  });
}

async function hasDeny(userId, fileId) {
  const doc = await DenyAccess.findOne({
    userId: toObjectId(userId),
    fileId
  }).lean();
  return Boolean(doc);
}

async function deleteDeniesForFile(fileId) {
  return DenyAccess.deleteMany({ fileId });
}

module.exports = {
  addDeny,
  removeDeny,
  hasDeny,
  deleteDeniesForFile
};
