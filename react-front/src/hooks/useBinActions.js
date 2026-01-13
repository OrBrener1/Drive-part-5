// src/hooks/useBinActions.js
// Handles Bin-related actions using apiClient only.

import { useCallback } from "react";
import { moveFileToBin, restoreFileFromBin, deleteFileForever} from "../api/apiClient";

export function useBinActions({ onUnauthorized } = {}) {
  const moveToBin = useCallback(
    async (itemId) => {
      try {
        await moveFileToBin(itemId);
      } catch (err) {
        if (err?.status === 401 && onUnauthorized) {
          onUnauthorized(err);
        }
        throw err;
      }
    },
    [onUnauthorized]
  );

  const restoreFromBin = useCallback(
    async (itemId) => {
      try {
        await restoreFileFromBin(itemId);
      } catch (err) {
        if (err?.status === 401 && onUnauthorized) {
          onUnauthorized(err);
        }
        throw err;
      }
    },
    [onUnauthorized]
  );

  const deleteForever = useCallback(
    async (itemId) => {
      try {
        await deleteFileForever(itemId);
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
    moveToBin,
    restoreFromBin,
    deleteForever,
  };
}
