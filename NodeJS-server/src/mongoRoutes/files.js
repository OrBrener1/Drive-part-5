const express = require('express');
const router = express.Router();
const filesController = require('../mongoControllers/FilesController');
const permissionsController = require('../mongoControllers/permissionsController');
const authService = require('../mongoServices/authService');
const filesRawController = require('../mongoControllers/filesRawController');

// GET /api/files
router.get('/', authService, filesController.getFilesInRootForUser);

// POST /api/files
router.post('/', authService, filesController.createFile);

// GET /api/files/shared
router.get('/shared', authService, filesController.getSharedWithMe);

// GET /api/files/recent
router.get('/recent', authService, filesController.getRecentFiles);

// GET /api/files/bin
router.get('/bin', authService, filesController.getBin);

// GET /api/files/:id/descendants
router.get('/:id/descendants', authService, filesController.getDescendants);

// GET /api/files/:id/raw  (DOWNLOAD)
router.get('/:id/raw', authService, filesRawController.getRawFile);
// GET /api/files/:id/raw-url (DOWNLOAD URL)
router.get('/:id/raw-url', authService, filesRawController.getRawUrl);

const multer = require('multer');
const upload = multer();

// POST /api/files/upload  (UPLOAD FILE)
router.post('/upload', authService, upload.single('file'), filesController.uploadFile);

// PUT /api/files/:id/replace  (REPLACE IMAGE FILE)
router.put('/:id/replace', authService, upload.single('file'), filesController.replaceFileById);
// POST /api/files/:id/replace  (RN multipart fallback)
router.post('/:id/replace', authService, upload.single('file'), filesController.replaceFileById);

// POST /api/files/:id/move
router.post('/:id/move', authService, filesController.moveFile);

// GET /api/files/:id
router.get('/:id', authService, filesController.getFileById);

// PATCH /api/files/:id
router.patch('/:id', authService, filesController.updateFileById);

// DELETE /api/files/:id
router.delete('/:id', authService, filesController.deleteFileById);

// PATCH /api/files/:id/star
router.patch('/:id/star', authService, filesController.toggleStar);

// PATCH /api/files/:id/bin
router.patch('/:id/bin', authService, filesController.moveToBin);

// PATCH /api/files/:id/restore
router.patch('/:id/restore', authService, filesController.restoreFromBin);

// Permissions as sub-resource of files
router.get('/:id/permissions', authService, permissionsController.getFilePermissions);
router.post('/:id/permissions', authService, permissionsController.createPermission);
router.patch('/:id/permissions/:pId', authService, permissionsController.updatePermission);
router.delete('/:id/permissions/:pId', authService, permissionsController.deletePermission);

module.exports = router;
