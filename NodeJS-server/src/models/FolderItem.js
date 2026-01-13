class FolderItem {
  constructor(
    id,
    name,
    ownerId,
    parentId = null,
    fullPath,
    createdAt,
    lastOpened
  ) {
    this.id = id;
    this.name = name;
    this.type = 'folder';
    this.ownerId = ownerId;
    this.parentId = parentId;
    this.fullPath = fullPath;
    // Timestamps
    this.createdAt = createdAt;
    this.lastOpened = lastOpened;
    // Starred state (default: not starred)
    this.isStarred = false;
    // Trashed state (default: not trashed)
    this.isTrashed = false;
    // Original parent ID for restore functionality
    this.originalParentId = null;
  }
}

module.exports = FolderItem;
