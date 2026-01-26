const mongoose = require('mongoose');
const Recent = require('../mongoModels/recentModel');

function toObjectId(id) {
  if (id == null) return null;
  return id instanceof mongoose.Types.ObjectId
    ? id
    : new mongoose.Types.ObjectId(id);
}

async function upsertRecent(userId, fileId, lastOpened) {
  const userObjectId = toObjectId(userId);
  return Recent.findOneAndUpdate(
    { userId: userObjectId, fileId },
    { userId: userObjectId, fileId, lastOpened },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

async function getLastOpened(userId, fileId) {
  const doc = await Recent.findOne({
    userId: toObjectId(userId),
    fileId
  })
    .select('lastOpened')
    .lean();

  return doc ? doc.lastOpened : null;
}

async function getUserRecents(userId, limit = 20) {
  const docs = await Recent.find({
    userId: toObjectId(userId)
  })
    .sort({ lastOpened: -1 })
    .limit(limit)
    .select('fileId lastOpened')
    .lean();

  return docs.map(doc => ({
    fileId: doc.fileId,
    lastOpened: doc.lastOpened
  }));
}

async function trimUserRecents(userId, keep = 20) {
  if (keep <= 0) {
    return Recent.deleteMany({ userId: toObjectId(userId) });
  }

  const overflow = await Recent.find({
    userId: toObjectId(userId)
  })
    .sort({ lastOpened: -1 })
    .skip(keep)
    .select('_id')
    .lean();

  if (!overflow.length) return null;

  const ids = overflow.map(doc => doc._id);
  return Recent.deleteMany({ _id: { $in: ids } });
}

module.exports = {
  upsertRecent,
  getLastOpened,
  getUserRecents,
  trimUserRecents
};
