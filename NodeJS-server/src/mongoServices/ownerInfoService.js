// Service layer that enriches items with owner info.

const userService = require('./userService');
const permissionService = require('./permissionService');

// Enrich items with owner display info for the UI (Mongo)
async function attachOwnerInfo(items, currentUserId) {
  return Promise.all(items.map(async item => {
    const owner = await userService.getUserById(item.ownerId);
    const ownerId = String(item.ownerId);
    const isShared =
      ownerId !== String(currentUserId)
        ? true
        : (await permissionService.getFilePermissions(item.id))
            .some(p => String(p.userId) !== ownerId);

    const ownerName = owner?.displayName || 'Unknown';
    const ownerEmail = owner?.email || '';
    const ownerImage = owner?.image || null;

    return {
      ...item,
      ownerName,
      ownerEmail,
      ownerImage,
      ownerLabel: ownerId === String(currentUserId) ? 'me' : ownerName,
      isShared
    };
  }));
}

module.exports = {
  attachOwnerInfo
};
