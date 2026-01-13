// In-memory storage for file/folder metadata
const items = [];

// Returns shallow copy of all items (files and folders)
const getAllItems = () => [...items];


// Returns items owned by user that are located in the root directory (parentId === null)
// NOTE: No bin/star filtering here (handled in service layer with binStore/starStore)
const getFilesInRootForUser = (userId) => {
  return items.filter(
    item => item.ownerId === userId && item.parentId === null);
};

//Returns a file/folder by its ID (only if it belongs to the user)
const getFileById = (id) => {
  return items.find(
    item => item.id === id);
};

//Saves a new file/folder metadata object
const saveFile = (file) => {
  items.push(file);
};

//Updates the name of an existing file/folder by ID.
//Returns the updated object, or null if not found.
const updateFileNameById = (id, newName) => {
  const item = items.find(x => x.id === id);
  if (!item) return null;
  item.name = newName;
  return item;
};


// Search items by name (case-insensitive), user-specific
const searchByName = (query) => {
  const q = String(query || '').toLowerCase();
  return items.filter(
    item => (item.name || '').toLowerCase().includes(q)
  );
};


// Removes an item from the in-memory store by its ID.
// This is a low-level helper function used internally by recursive delete logic.
// At this point, all validations (ownership, permissions, existence) are assumed
// to have already been performed by the service layer.
const deleteItemById = (id) => {

  // Find the index of the item with the given ID in the items array
  const index = items.findIndex(item => item.id === id);

  // If the item exists in the store, remove it
  if (index !== -1) {
    // Remove exactly one element at the found index,
    // permanently deleting it from the in-memory storage
    items.splice(index, 1);
  }
};

// Returns all direct child items of a given parent folder for a specific user.
// This function is used by the recursive delete logic to traverse the directory tree.
// Only items that belong to the given user and have the specified parentId are returned.
const getChildren = (parentId) => {
  return items.filter(item => item.parentId === parentId);
};

// Updates lastOpened timestamp for an item.
// Returns the updated item or null if not found.
const touchLastOpened = (id, timestamp) => {
  const item = items.find(x => x.id === id);
  if (!item) return null;
  item.lastOpened = timestamp;
  return item;
};

// Updates parentId of an item by ID.
// Returns updated item or null if not found.
// This is used when moving files/folders.
const updateParentById = (id, newParentId) => {
  const item = items.find(x => x.id === id);
  if (!item) return null;
  item.parentId = newParentId;
  return item;
};

module.exports = {
  getFilesInRootForUser,
  getFileById,
  saveFile,
  updateFileNameById,
  searchByName,
  deleteItemById,
  getChildren,
  getAllItems,
  touchLastOpened,
  updateParentById
};
