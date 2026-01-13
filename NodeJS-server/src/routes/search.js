const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authService = require('../services/authService');

// GET /api/search/:query
router.get('/:query', authService, searchController.searchFiles);

module.exports = router;