const Item = require('../mongoModels/ItemModel');
const FileSystemItemFactory = require('../models/FileSystemItemFactory');
const mongoose = require('mongoose');

/**
 * Convert Mongo Item document into domain FileItem / FolderItem
 * Keeps service layer unchanged
 */
function toDomainItem(mongoItem) {
  if (!mongoItem) return null;

  return FileSystemItemFactory.create(
    mongoItem.type,
    mongoItem._id,
    mongoItem.name,
    mongoItem.ownerId.toString(),
    mongoItem.parentId,
    mongoItem.fullPath,
    mongoItem.createdAt,
    mongoItem.lastOpened
  );
}
//convert array of mongo items to domain items
function toDomainItems(mongoItems) {
  return mongoItems.map(toDomainItem);
}

const getFileById = async (id) => {
  const mongoItem = await Item.findById(id).lean();
  return toDomainItem(mongoItem);
};
/**
 * Returns all direct child items of a given parent folder
 */
const getChildren = async (parentId) => {
  const mongoItems = await Item
    .find({ parentId })
    .lean();

  return mongoItems.map(toDomainItem);
};
/**
 * Returns items owned by user that are located in the root directory
 */
const getFilesInRootForUser = async (userId) => {
  const mongoItems = await Item
    .find({
      ownerId: new mongoose.Types.ObjectId(userId),
      parentId: null
    })
    .lean();

  return mongoItems.map(toDomainItem);
};
/**
 * Saves a new file/folder metadata object
 */
const saveFile = async (file) => {
  await Item.create({
    _id: file.id,
    name: file.name,
    type: file.type,
    ownerId: new mongoose.Types.ObjectId(file.ownerId),
    parentId: file.parentId,
    fullPath: file.fullPath,
    contentType: file.contentType,
    lastOpened: file.lastOpened,
    originalParentId: file.originalParentId
  });
};
/**
 * Updates the name of an existing item by ID
 */
const updateFileNameById = async (id, newName) => {
  const mongoItem = await Item.findByIdAndUpdate(
    id,
    { name: newName },
    { new: true }
  ).lean();

  return toDomainItem(mongoItem);
};
/**
 * Updates parentId of an item by ID
 */
const updateParentById = async (id, newParentId) => {
  const mongoItem = await Item.findByIdAndUpdate(
    id,
    { parentId: newParentId },
    { new: true }
  ).lean();

  return toDomainItem(mongoItem);
};
/**
 * Updates lastOpened timestamp for an item
 */
const touchLastOpened = async (id, timestamp) => {
  const mongoItem = await Item.findByIdAndUpdate(
    id,
    { lastOpened: timestamp },
    { new: true }
  ).lean();

  return toDomainItem(mongoItem);
};
/**
 * Returns all items (files and folders)
 */
const getAllItems = async () => {
  const mongoItems = await Item.find({}).lean();
  return mongoItems.map(toDomainItem);
};
/**
 * Search items by name (case-insensitive)
 */
const searchByName = async (query) => {
  const q = String(query || '').toLowerCase();

  const mongoItems = await Item.find({
    name: { $regex: q, $options: 'i' }
  }).lean();

  return mongoItems.map(toDomainItem);
};

/**
 * Removes an item from the database by its ID
 */
const deleteItemById = async (id) => {
  await Item.deleteOne({ _id: id });
};


module.exports = {
  getFileById,
  getChildren,
  getFilesInRootForUser,
  getAllItems,
  searchByName,
  saveFile,
  updateFileNameById,
  updateParentById,
  touchLastOpened,
  deleteItemById
};

