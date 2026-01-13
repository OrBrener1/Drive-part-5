class FileItem {
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
    this.type = 'file';
    this.ownerId = ownerId;
    this.parentId = parentId;
    this.fullPath = fullPath;
    // Timestamps
    this.createdAt = createdAt;
    this.lastOpened = lastOpened;
    this.contentType = 'text';
    // Original parent ID for restore functionality
    this.originalParentId = null;
  }
}

module.exports = FileItem;
