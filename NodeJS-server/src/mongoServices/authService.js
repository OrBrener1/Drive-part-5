// JWT authentication middleware (token validation only).

const jwt = require('jsonwebtoken');

// Same secret used when signing the JWT
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

/**
 * Authentication middleware
 * Verifies JWT from Authorization header
 * Attaches user info to request
 *
 * NOTE:
 * - Does NOT access the database
 * - Does NOT validate user existence
 * - Only validates token (per course architecture)
 */
function authService(req, res, next) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query?.token || req.query?.access_token;
  let token = null;

  if (authHeader) {
    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'invalid authorization format' });
    }
    token = parts[1];
  } else if (queryToken) {
    token = queryToken;
  } else {
    return res.status(401).json({ error: 'token required' });
  }

  try {
    // Verify token signature (and expiration if exists)
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded info to request
    // userId is now MongoDB ObjectId (string)
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    req.userId = decoded.userId;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}

module.exports = authService;
