const jwt = require('jsonwebtoken');
const usersModel = require('../models/usersModel');
const userService = require('../services/userService');

// JWT secret key
// In a real system this should be stored securely (environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

/**
 * POST /api/tokens
 * Login endpoint: validates user credentials and returns a JWT
 */
function createToken(req, res) {
  const { email, password } = req.body || {};

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'missing email or password' });
  }

  try {
    const normalizedEmail = userService.validateEmail(email);
    userService.validatePassword(password);

    // Authenticate user (throws error if invalid)
    const user = usersModel.authenticate(normalizedEmail, password);

    if (!user) {
      return res.status(401).json({ error: 'invalid email or password' });
    }

    // Payload stored inside the JWT
    const payload = {
      userId: user.id,
      email: user.email
    };

    // Create signed JWT
    const token = jwt.sign(payload, JWT_SECRET, {

      // Token expires after 1 hour (security vs. usability tradeoff)
      expiresIn: '1h'
    });

    // Return token to client
    return res.status(201).json({ token });

  } catch (err) {
    return res.status(400).json({ error: 'invalid email or password format' });
  }
}

module.exports = {
  createToken
};
