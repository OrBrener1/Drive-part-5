const FileItem = require('./FileItem');
const FolderItem = require('./FolderItem');

class FileSystemItemFactory {
  static create(
    type,
    id,
    name,
    ownerId,
    parentId = null,
    fullPath,
    createdAt,
    lastOpened
  ) {
    switch (type) {
      case 'file':
        return new FileItem(
          id,
          name,
          ownerId,
          parentId,
          fullPath,
          createdAt,
          lastOpened
        );
      case 'folder':
        return new FolderItem(
          id,
          name,
          ownerId,
          parentId,
          fullPath,
          createdAt,
          lastOpened
        );
      default:
        throw new Error('INVALID_TYPE');
    }
  }
}
module.exports = FileSystemItemFactory;
