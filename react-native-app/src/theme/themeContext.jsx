import React, { createContext, useMemo, useState } from "react";
import { lightTheme } from "./theme";

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme] = useState(lightTheme);

  const value = useMemo(() => ({ theme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
