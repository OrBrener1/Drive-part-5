const userService = require('./userService');

// Enrich items with owner display info for the UI (Mongo)
async function attachOwnerInfo(items, currentUserId) {
  return Promise.all(items.map(async item => {
    const owner = await userService.getUserById(item.ownerId);

    const ownerName = owner?.displayName || 'Unknown';
    const ownerEmail = owner?.email || '';
    const ownerImage = owner?.image || null;

    return {
      ...item,
      ownerName,
      ownerEmail,
      ownerImage,
      ownerLabel: String(item.ownerId) === String(currentUserId) ? 'me' : ownerName
    };
  }));
}

module.exports = {
  attachOwnerInfo
};
