// src/controllers/usersController.js

const userService = require('../services/userService');
const userModel = require('../models/usersModel');
const themeStore = require('../services/themeStore');
function register(req, res) {
  try {
    const { email, password, displayName, image } = req.body || {};

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'missing fields' });
    }

    const user = userService.registerUser({
      password,
      email,
      displayName,
      image: image || null
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      image: user.image
    });

  } catch (err) {
    if (err.message === 'USER_ALREADY_EXISTS') {
      return res.status(409).json({ error: 'user already exists' });
    }

    return res.status(400).json({ error: err.message });
  }
}
// GET /api/users/:id
function getUserById(req, res) {
  const { id } = req.params;

  const user = userService.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  return res.status(200).json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    image: user.image
  });
}

// GET /api/users/me
function getMe(req, res) {
  // authService already verified the token and set req.userId
  const userId = req.userId;

  const user = userModel.getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  // Return only the fields needed by the frontend
  return res.status(200).json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    image: user.image
  });
}




// GET /api/users/me/theme
function getThemePreference(req, res) {
  const userId = req.userId;
  const theme = themeStore.getTheme(userId);

  if (theme === 'light' || theme === 'dark') {
    return res.status(200).json({ theme });
  }

  return res.status(200).json({ theme: null });
}

// PUT /api/users/me/theme
function setThemePreference(req, res) {
  const userId = req.userId;
  const { theme } = req.body || {};

  if (theme !== 'light' && theme !== 'dark') {
    return res.status(400).json({ error: 'invalid theme' });
  }

  themeStore.setTheme(userId, theme);
  return res.status(204).send();
}

// PUT /api/users/me/avatar
function setAvatar(req, res) {
  const userId = req.userId;
  let { image } = req.body || {};

  if (image === "") image = null;
  if (image !== null && typeof image !== "string") {
    return res.status(400).json({ error: "invalid image" });
  }

  const user = userModel.getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  user.image = image || null;

  return res.status(200).json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    image: user.image,
  });
}

module.exports = {
  register,
  getUserById,
  getMe,
  getThemePreference,
  setThemePreference,
  setAvatar
};
