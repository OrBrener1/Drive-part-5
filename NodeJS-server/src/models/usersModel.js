const usersById = new Map();        // id -> user (source of truth)
const usersByEmail = new Map(); // email -> id (index)
let nextId = 1;

// Adds a new user to the system.
// Returns the created user, or null if the email already exists.
function addUser({ email, password, displayName, image }) {
  if (usersByEmail.has(email)) return null;

  const user = {
    id: nextId++,
    email,
    password,
    displayName,
    image
  };

  // Store user once (source of truth)
  usersById.set(user.id, user);
  // Store email as an index to user id
  usersByEmail.set(email, user.id);

  return user;
}

// Authenticates a user by email and password.
// Returns the user if authentication is successful, or null otherwise.
function authenticate(email, password) {
  const userId = usersByEmail.get(email);
  if (!userId) return null;

  const user = usersById.get(userId);
  if (!user) return null;

  return user.password === password ? user : null;
}
// we can get user by email, or by id.
// Retrieves a user by their email.
function getUserByEmail(email) {
  const id = usersByEmail.get(email);
  return id ? usersById.get(id) : null;
}
// Retrieves a user by their ID.
function getUserById(id) {
  return usersById.get(id) || null;
}

module.exports = {
  addUser,
  authenticate,
  getUserById,
  getUserByEmail,
};