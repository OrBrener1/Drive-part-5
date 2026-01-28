// Express routes for search endpoints.

const express = require('express');
const router = express.Router();
const authService = require('../mongoServices/authService');
const searchController = require('../mongoControllers/searchController');

// GET /api/search/:query
router.get('/:query', authService, searchController.searchFiles);

module.exports = router;
