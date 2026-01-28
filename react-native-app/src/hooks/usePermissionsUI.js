// React hook for Permissions UI state and actions.

import { useState } from "react";

export function usePermissionsUI() {
  const [isPermOpen, setIsPermOpen] = useState(false);
  const [permItem, setPermItem] = useState(null);

  function openPermissions(item) {
    setPermItem(item);
    setIsPermOpen(true);
  }

  function closePermissions() {
    setIsPermOpen(false);
    setPermItem(null);
  }

  return {
    isPermOpen,
    permItem,
    openPermissions,
    closePermissions,
  };
}
