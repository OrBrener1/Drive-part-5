// In-memory per-user theme store.
// Maps userId -> theme string ("light" or "dark").
const themeByUser = new Map();

function getTheme(userId) {
  return themeByUser.get(userId) || null;
}

function setTheme(userId, theme) {
  themeByUser.set(userId, theme);
  return theme;
}

module.exports = {
  getTheme,
  setTheme
};
