// React context for create menu UI state.

import { createContext, useContext, useState } from "react";

const CreateUIContext = createContext(null);

export function CreateUIProvider({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  return (
    <CreateUIContext.Provider value={{ menuOpen, openMenu, closeMenu }}>
      {children}
    </CreateUIContext.Provider>
  );
}

export function useCreateUI() {
  const ctx = useContext(CreateUIContext);
  if (!ctx) {
    throw new Error("useCreateUI must be used inside CreateUIProvider");
  }
  return ctx;
}
