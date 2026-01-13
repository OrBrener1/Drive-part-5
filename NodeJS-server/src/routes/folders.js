const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const filesController = require('../controllers/filesController');

// GET /api/folders
router.get('/', authService, filesController.getMoveFolders);

module.exports = router;
