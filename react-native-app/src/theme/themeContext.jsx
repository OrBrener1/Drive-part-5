import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as FileSystem from "expo-file-system";
import { lightTheme, darkTheme } from "./Theme";
import { AuthContext } from "../context/AuthContext";
import { getThemePreference, setThemePreference } from "../api/apiClient";

export const ThemeContext = createContext(null);

const THEME_PREFS_PATH = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}theme-preferences.json`
  : null;

function getUserKeys(user) {
  if (!user) return [];
  const keys = [];
  if (user.id !== undefined && user.id !== null) {
    keys.push(`id:${user.id}`);
  }
  if (user.userId !== undefined && user.userId !== null) {
    keys.push(`userId:${user.userId}`);
  }
  if (user.email) {
    keys.push(`email:${user.email}`);
  }
  return keys;
}

async function readPrefs() {
  if (!THEME_PREFS_PATH) return {};
  try {
    const info = await FileSystem.getInfoAsync(THEME_PREFS_PATH);
    if (!info.exists) return {};
    const raw = await FileSystem.readAsStringAsync(THEME_PREFS_PATH);
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

async function writePrefs(prefs) {
  if (!THEME_PREFS_PATH) return;
  try {
    await FileSystem.writeAsStringAsync(
      THEME_PREFS_PATH,
      JSON.stringify(prefs)
    );
  } catch {
    // Ignore storage errors to avoid blocking UI
  }
}

async function readLocalPreference(user) {
  const keys = getUserKeys(user);
  if (keys.length === 0) return null;
  const prefs = await readPrefs();
  for (const key of keys) {
    if (prefs[key] === "light" || prefs[key] === "dark") {
      return prefs[key];
    }
  }
  return null;
}

async function writeLocalPreference(user, mode) {
  const keys = getUserKeys(user);
  if (keys.length === 0) return;
  const prefs = await readPrefs();
  for (const key of keys) {
    prefs[key] = mode;
  }
  await writePrefs(prefs);
}

export function ThemeProvider({ children }) {
  const { user, token } = useContext(AuthContext);
  const [mode, setMode] = useState("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPreference() {
      if (!token) {
        if (!cancelled) {
          setMode("light");
          setReady(true);
        }
        return;
      }

      try {
        const result = await getThemePreference();
        if (cancelled) return;
        const saved = result?.theme;
        if (saved === "light" || saved === "dark") {
          setMode(saved);
          if (user) {
            await writeLocalPreference(user, saved);
          }
          setReady(true);
          return;
        }
      } catch {
        if (cancelled) return;
      }

      const local = user ? await readLocalPreference(user) : null;
      const nextMode = local || "light";
      if (!cancelled) {
        setMode(nextMode);
        setReady(true);
      }
    }

    loadPreference();
    return () => {
      cancelled = true;
    };
  }, [token, user?.id, user?.email]);

  const persistTheme = useCallback(
    async (nextMode) => {
      if (user) {
        await writeLocalPreference(user, nextMode);
      }
      if (token) {
        await setThemePreference(nextMode).catch(() => {});
      }
    },
    [user, token]
  );

  const setThemeMode = useCallback(
    (nextMode) => {
      setMode(nextMode);
      persistTheme(nextMode);
    },
    [persistTheme]
  );

  const toggleTheme = useCallback(() => {
    if (!token) return;
    setMode((prev) => {
      const nextMode = prev === "dark" ? "light" : "dark";
      persistTheme(nextMode);
      return nextMode;
    });
  }, [token, persistTheme]);

  const theme = mode === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ theme, mode, setThemeMode, toggleTheme, ready }),
    [theme, mode, setThemeMode, toggleTheme, ready]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
