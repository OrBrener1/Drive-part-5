const mongoose = require('mongoose');
const Permission = require('../mongoModels/permissionModel');

function toObjectId(id) {
  if (id == null) return null;
  return id instanceof mongoose.Types.ObjectId
    ? id
    : new mongoose.Types.ObjectId(id);
}

async function createPermission(fileId, userId, type, metadata = {}) {
  return Permission.create({
    fileId,
    userId: toObjectId(userId),
    type,
    metadata
  });
}

async function getById(id) {
  return Permission.findById(id).lean();
}

async function getByUserAndFile(userId, fileId) {
  return Permission.findOne({
    userId: toObjectId(userId),
    fileId
  }).lean();
}

async function getFilePermissions(fileId) {
  return Permission.find({ fileId }).lean();
}

async function getUserPermissions(userId, type = null) {
  const query = { userId: toObjectId(userId) };
  if (type) query.type = type;
  return Permission.find(query).lean();
}

async function updatePermission(id, updates = {}) {
  return Permission.findByIdAndUpdate(id, updates, { new: true }).lean();
}

async function deletePermission(id) {
  return Permission.deleteOne({ _id: id });
}

async function deletePermissionByUserAndFile(userId, fileId) {
  return Permission.deleteOne({
    userId: toObjectId(userId),
    fileId
  });
}

async function deletePermissionsForFile(fileId) {
  return Permission.deleteMany({ fileId });
}

module.exports = {
  createPermission,
  getById,
  getByUserAndFile,
  getFilePermissions,
  getUserPermissions,
  updatePermission,
  deletePermission,
  deletePermissionByUserAndFile,
  deletePermissionsForFile
};
