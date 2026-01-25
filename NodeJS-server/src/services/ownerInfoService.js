const userModel = require('../models/usersModel');
const permissionStore = require('./permissionStore');

// Enrich items with owner display info for the UI
function attachOwnerInfo(items, currentUserId) {
  return items.map(item => {
    const ownerId = Number(item.ownerId);
    const owner = userModel.getUserById(ownerId);
    const isShared =
      String(item.ownerId) !== String(currentUserId)
        ? true
        : permissionStore
            .getFilePermissions(item.id)
            .some(p => String(p.userId) !== String(item.ownerId));

    const ownerName = owner?.displayName || 'Unknown';
    const ownerEmail = owner?.email || '';
    const ownerImage = owner?.image || null;

    return {
      ...item,
      ownerName,
      ownerEmail,
      ownerImage,
      // UI helper: show "me" when current user is the owner (like Google Drive)
      ownerLabel: ownerId === Number(currentUserId) ? 'me' : ownerName,
      isShared
    };
  });
}

module.exports = {
  attachOwnerInfo
};
