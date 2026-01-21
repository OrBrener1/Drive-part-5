import { useCallback } from "react";
import { Alert } from "react-native";
import { moveFileToBin, restoreFileFromBin, toggleStar } from "../api/filesApi";

export function useFileActions({ loadFiles, onUnauthorized } = {}) {
  const handleToggleStar = useCallback(
    async (item) => {
      try {
        await toggleStar(item.id);
        await loadFiles?.();
      } catch (e) {
        if (e?.message === "UNAUTHORIZED") onUnauthorized?.(e);
      }
    },
    [loadFiles, onUnauthorized]
  );

  const handleMoveToBin = useCallback(
    async (item) => {
      try {
        await moveFileToBin(item.id);
        await loadFiles?.();
      } catch (e) {
        if (e?.message === "UNAUTHORIZED") onUnauthorized?.(e);
        Alert.alert("Failed to move to bin", e?.message || "Please try again.");
      }
    },
    [loadFiles, onUnauthorized]
  );

  const handleRestoreFromBin = useCallback(
    async (item) => {
      try {
        await restoreFileFromBin(item.id);
        await loadFiles?.();
      } catch (e) {
        if (e?.message === "UNAUTHORIZED") onUnauthorized?.(e);
        Alert.alert("Failed to restore", e?.message || "Please try again.");
      }
    },
    [loadFiles, onUnauthorized]
  );

  return {
    handleToggleStar,
    handleMoveToBin,
    handleRestoreFromBin,
  };
}
