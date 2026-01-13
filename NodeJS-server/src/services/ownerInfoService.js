const userModel = require('../models/usersModel');

// Enrich items with owner display info for the UI
function attachOwnerInfo(items, currentUserId) {
  return items.map(item => {
    const ownerId = Number(item.ownerId);
    const owner = userModel.getUserById(ownerId);

    const ownerName = owner?.displayName || 'Unknown';
    const ownerEmail = owner?.email || '';
    const ownerImage = owner?.image || null;

    return {
      ...item,
      ownerName,
      ownerEmail,
      ownerImage,
      // UI helper: show "me" when current user is the owner (like Google Drive)
      ownerLabel: ownerId === Number(currentUserId) ? 'me' : ownerName
    };
  });
}

module.exports = {
  attachOwnerInfo
};
