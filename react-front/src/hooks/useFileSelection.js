import { useCallback, useState } from "react";

/**
 * Manages file/folder selection state.
 * Pure UI state: no API calls, no routing, no side effects.
 */
export function useFileSelection() {
  const [selectedId, setSelectedId] = useState(null);

  const select = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const clear = useCallback(() => {
    setSelectedId(null);
  }, []);

  const isSelected = useCallback(
    (id) => selectedId === id,
    [selectedId]
  );

  return {
    selectedId,
    select,
    clear,
    isSelected
  };
}
