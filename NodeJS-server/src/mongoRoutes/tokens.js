const express = require('express');
const router = express.Router();
const tokensController = require('../mongoControllers/tokensController');

// POST /api/tokens → login
router.post('/', tokensController.createToken);

module.exports = router;

