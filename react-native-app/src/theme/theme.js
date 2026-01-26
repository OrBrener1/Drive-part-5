// src/theme/theme.js

const baseTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    title: 22,
    body: 15,
    small: 13,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    round: 999,
  },
};

export const lightTheme = {
  ...baseTokens,
  colors: {
    background: "#f5f7fb",
    surface: "#ffffff",
    primary: "#5a86e8",
    primaryDisabled: "#9bb4ec",
    onPrimary: "#ffffff",
    overlay: "rgba(15, 23, 42, 0.35)",

    textPrimary: "#111827",
    textSecondary: "#555",

    border: "#d0d7e2",

    pending: "#9aa3af",
    error: "#e53935",
    success: "#2e7d32",
  },
};

export const darkTheme = {
  ...baseTokens,
  colors: {
    background: "#0f172a",
    surface: "#020617",
    primary: "#7aa2ff",
    primaryDisabled: "#475569",
    onPrimary: "#0f172a",
    overlay: "rgba(15, 23, 42, 0.6)",

    textPrimary: "#f8fafc",
    textSecondary: "#cbd5f5",

    border: "#334155",

    pending: "#94a3b8",
    error: "#ef4444",
    success: "#22c55e",
  },
};
