import { useContext } from "react";
import { useTheme } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import "./ThemeToggle.css";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return null;
  }

  const isDark = theme === "dark";
  const label = isDark ? "Light" : "Dark";
  const icon = isDark ? "☀️" : "🌙";

  return (
    <button
      type="button"
      className="btn btn-ghost themeToggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${label} mode`}
      title={`${label} mode`}
    >
      <span className="themeToggleIcon" aria-hidden="true">
        {icon}
      </span>
      <span className="themeToggleLabel">{label}</span>
    </button>
  );
}

export default ThemeToggle;
