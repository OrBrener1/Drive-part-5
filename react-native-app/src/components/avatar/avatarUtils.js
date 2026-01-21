// src/components/avatar/avatarUtils.js

const AVATAR_COLORS = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#3f51b5",
  "#2196f3",
  "#009688",
  "#4caf50",
  "#ff9800",
  "#795548",
];

// Initials: displayName → email → "?"
export function getAvatarInitial(user) {
  if (!user) return "?";

  const base =
    (user.displayName || "").trim() ||
    (user.email || "").trim();

  if (!base) return "?";

  return base.charAt(0).toUpperCase();
}

// Deterministic color per user
export function getAvatarColor(user) {
  if (!user) return AVATAR_COLORS[0];

  const base =
    (user.displayName || "").trim() ||
    (user.email || "").trim();

  if (!base) return AVATAR_COLORS[0];

  const charCode = base.charCodeAt(0);
  const index = charCode % AVATAR_COLORS.length;

  return AVATAR_COLORS[index];
}
