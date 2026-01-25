import { createContext, useContext, useMemo, useState } from "react";

const ViewModeContext = createContext({
  viewMode: "list",
  toggleViewMode: () => {},
});

export function ViewModeProvider({ children }) {
  const [viewMode, setViewMode] = useState("list");

  const value = useMemo(
    () => ({
      viewMode,
      toggleViewMode: () =>
        setViewMode((prev) => (prev === "grid" ? "list" : "grid")),
    }),
    [viewMode]
  );

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
