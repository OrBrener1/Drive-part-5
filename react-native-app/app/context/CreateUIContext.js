import { createContext, useContext, useMemo, useState } from "react";

const CreateUIContext = createContext(null);

export function CreateUIProvider({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const value = useMemo(
    () => ({
      menuOpen,
      openMenu: () => setMenuOpen(true),
      closeMenu: () => setMenuOpen(false),
    }),
    [menuOpen]
  );

  return (
    <CreateUIContext.Provider value={value}>
      {children}
    </CreateUIContext.Provider>
  );
}

export function useCreateUI() {
  const ctx = useContext(CreateUIContext);
  if (!ctx) {
    throw new Error("useCreateUI must be used within CreateUIProvider");
  }
  return ctx;
}
