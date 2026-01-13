// src/components/userAvatarMenu/UserAvatar.jsx
import React from "react";
import "./userAvatarMenu.css";

function getAvatarColor(letter) {
  const colors = [
    "#f44336", "#e91e63", "#9c27b0", "#3f51b5",
    "#2196f3", "#009688", "#4caf50", "#ff9800", "#795548",
  ];
  if (!letter) return colors[0];
  const index = letter.charCodeAt(0) % colors.length;
  return colors[index];
}

/**
 * Reusable Avatar Component
 * Props:
 * - user: object { displayName, image, ... }
 * - className: optional string for extra styling
 */
export default function UserAvatar({ user, className = "" }) {
  if (!user) return null;

  // 1. If user has an image
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.displayName || "User"}
        className={`user-avatar ${className}`}
      />
    );
  }

  // 2. Fallback to initials with color
  const letter = (user.displayName || "?").charAt(0).toUpperCase();
  const bgColor = getAvatarColor(letter);

  return (
    <div
      className={`user-avatar-placeholder ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {letter}
    </div>
  );
}