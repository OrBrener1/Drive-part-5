import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import { getThemePreference, setThemePreference } from "../api/apiClient";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

function applyThemeAttribute(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const { isAuthenticated, user } = useContext(AuthContext);

  // Initial load + auth changes: guests are always light; users load their preference.
  useEffect(() => {
    let isActive = true;

    if (!isAuthenticated) {
      setTheme("light");
      applyThemeAttribute("light");
      return () => {
        isActive = false;
      };
    }

    async function loadTheme() {
      try {
        const result = await getThemePreference();
        if (!isActive) return;
        const saved = result?.theme;
        if (saved === "light" || saved === "dark") {
          setTheme(saved);
          applyThemeAttribute(saved);
          return;
        }
      } catch (err) {
        if (!isActive) return;
      }

      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      applyThemeAttribute(initial);
    }

    loadTheme();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, user]);

  // Sync attribute + persistence when theme changes
  useEffect(() => {
    applyThemeAttribute(theme);
    if (!isAuthenticated) return;
    setThemePreference(theme).catch(() => {});
  }, [theme, isAuthenticated]);

  const toggleTheme = useCallback(() => {
    if (!isAuthenticated) return;
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
