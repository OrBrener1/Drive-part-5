const express = require('express');
const router = express.Router();
const authService = require('../mongoServices/authService');
const filesController = require('../mongoControllers/FilesController');

// GET /api/folders
router.get('/', authService, filesController.getMoveFolders);

module.exports = router;
