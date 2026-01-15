const User = require('./mongoModels/UsersModel');   

// ========================
// VALIDATIONS (unchanged)
// ========================

const MIN_PASSWORD_LENGTH = 8;

function validatePassword(password) {
  if (typeof password !== 'string') {
    throw new Error('password must be a string');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (!/[a-z]/.test(password)) {
    throw new Error('password must contain lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('password must contain uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    throw new Error('password must contain a digit');
  }
}

function validateEmail(email) {
  if (typeof email !== 'string') {
    throw new Error('email must be a string');
  }

  const normalized = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('invalid email format');
  }

  return normalized;
}

function validateDisplayName(name) {
  if (typeof name !== 'string') {
    throw new Error('displayName must be a string');
  }

  const n = name.trim().replace(/\s+/g, ' ');

  if (n.length < 2) {
    throw new Error('displayName too short');
  }

  return n;
}

// ========================
// SERVICE FUNCTIONS (Mongo)
// ========================

async function registerUser({ email, password, displayName, image }) {
  validatePassword(password);
  const validEmail = validateEmail(email);
  const validDisplayName = validateDisplayName(displayName);

  const existing = await User.findOne({ email: validEmail });
  if (existing) {
    throw new Error('USER_ALREADY_EXISTS');
  }

  const user = await User.create({
    email: validEmail,
    password,          
    displayName: validDisplayName,
    image
  });

  return user;
}

async function getUserById(id) {
  if (!id) return null;
  return await User.findById(id);
}

async function getUserByEmail(email) {
  const validEmail = validateEmail(email);
  return await User.findOne({ email: validEmail });
}

async function authenticate(email, password) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  return user.password === password ? user : null;
}

module.exports = {
  validatePassword,
  validateEmail,
  validateDisplayName,
  registerUser,
  getUserById,
  getUserByEmail,
  authenticate
};
