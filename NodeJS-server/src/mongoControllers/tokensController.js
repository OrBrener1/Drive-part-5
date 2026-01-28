// HTTP controllers for auth token endpoints.

const jwt = require('jsonwebtoken');
const userService = require('../mongoServices/userService');

// JWT secret key
// In a real system this should be stored securely (environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

/**
 * POST /api/tokens
 * Login endpoint
 */
async function createToken(req, res) {
  const { email, password } = req.body || {};
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'missing email or password' });
  }

  try {
    const normalizedEmail = userService.validateEmail(email);
    userService.validatePassword(password);

    const user = await userService.authenticate(normalizedEmail, password);

    if (!user) {
    return res.status(401).json({ error: 'invalid email or password' });
    }
    // Payload stored inside the JWT
    const payload = {
      userId: user._id.toString(),
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
