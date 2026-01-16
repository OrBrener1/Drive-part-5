const userService = require('../mongoServices/userService');

/**
 * POST /api/users
 * Register new user
 */
async function register(req, res) {
  try {
    const { email, password, displayName, image } = req.body || {};

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'missing fields' });
    }

    const user = await userService.registerUser({
      email,
      password,
      displayName,
      image: image || null
    });

    return res.status(201).json({
      id: user._id.toString(),
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

/**
 * GET /api/users/:id
 */
async function getUserById(req, res) {
  const { id } = req.params;

  const user = await userService.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  return res.status(200).json({
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
    image: user.image
  });
}

/**
 * GET /api/users/me
 * Requires authService middleware
 */
async function getMe(req, res) {
// authService already verified the token and set req.userId
  const userId = req.userId;

  const user = await userService.getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  return res.status(200).json({
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
    image: user.image
  });
}
// Theme now is a field in user object so no need to import themeStore.
/**
 * GET /api/users/me/theme
 */
async function getThemePreference(req, res) {
  const userId = req.userId;

  const user = await userService.getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  return res.status(200).json({
    theme: user.theme || null
  });
}

/**
 * PUT /api/users/me/theme
 */
async function setThemePreference(req, res) {
  const userId = req.userId;
  const { theme } = req.body || {};

  if (theme !== 'light' && theme !== 'dark') {
    return res.status(400).json({ error: 'invalid theme' });
  }

  const user = await userService.getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  user.theme = theme;
  await user.save();

  return res.status(204).send();
}

module.exports = {
  register,
  getUserById,
  getMe,
  getThemePreference,
  setThemePreference
};
