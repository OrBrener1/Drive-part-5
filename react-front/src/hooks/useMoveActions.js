// src/hooks/useMoveActions.js
import { useCallback } from "react";
import { moveFile } from "../api/apiClient";

export function useMoveActions({ onUnauthorized } = {}) {
  const moveItem = useCallback(
    async (itemId, targetParentId) => {
      try {
        await moveFile(itemId, targetParentId);
      } catch (err) {
        if (err?.status === 401 && onUnauthorized) {
          onUnauthorized(err);
        }
        throw err;
      }
    },
    [onUnauthorized]
  );

  return {
    moveItem,
  };
}
