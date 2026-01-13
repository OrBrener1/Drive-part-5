const PermissionManager = require('./permissionManager');

// Singleton: one in-memory store for the whole server process
module.exports = new PermissionManager({
  debug: false
});