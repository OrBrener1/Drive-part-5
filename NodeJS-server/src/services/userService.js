// src/services/userService.js

const userModel = require('../models/usersModel');

//VALIDATIONS
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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error('invalid email format');
  }
  // Simple normalization: lowercase, email is case-insensitive
  return email.toLowerCase();
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

// SERVICE FUNCTIONS

function registerUser({ email, password, displayName, image }) {
  validatePassword(password);
  const validEmail = validateEmail(email);
  const validDisplayName = validateDisplayName(displayName);


  const user = userModel.addUser({
    email: validEmail,
    password,
    displayName: validDisplayName,
    image
  });

  if (!user) {
    throw new Error('USER_ALREADY_EXISTS');
  }

  return user;
}

function getUserById(id) {
  // Currently, user IDs are numeric.
  // If IDs become strings (e.g. UUIDs), this conversion should be removed.
  return userModel.getUserById(Number(id));
}


module.exports = {
  validatePassword,
  validateEmail,
  registerUser,
  getUserById
};
