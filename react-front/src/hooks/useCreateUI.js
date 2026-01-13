import { useState } from "react";

export function useCreateUI() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function openMenu() {
    setIsMenuOpen(true);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return {
    isMenuOpen,
    openMenu,
    closeMenu,
  };
}
