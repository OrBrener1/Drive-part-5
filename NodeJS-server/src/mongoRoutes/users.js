
const express = require('express');
const router = express.Router();
const usersController = require('../mongoControllers/usersController');
const authService = require('../mongoServices/authService');

// POST /api/users → register
router.post('/', usersController.register);

// GET /api/users/me → current logged-in user
router.get('/me', authService, usersController.getMe);

// GET /api/users/me/theme
router.get('/me/theme', authService, usersController.getThemePreference);

// PUT /api/users/me/theme
router.put('/me/theme', authService, usersController.setThemePreference);

// GET /api/users/:id → get user (requires login so goes through requireAuth)
router.get('/:id', authService, usersController.getUserById);

module.exports = router;
