import { useCallback } from "react";
import { Alert } from "react-native";
import { moveFileToBin, restoreFileFromBin, toggleStar } from "../api/filesApi";
import { getErrorMessage } from "../utils/errorMessages";

export function useFileActions({ loadFiles, onUnauthorized } = {}) {
  const handleToggleStar = useCallback(
    async (item) => {
      try {
        await toggleStar(item.id);
        await loadFiles?.();
      } catch (e) {
        if (e?.message === "UNAUTHORIZED" || e?.status === 401) {
          onUnauthorized?.(e);
          return;
        }
        Alert.alert(
          "Failed to update star",
          getErrorMessage(e, { fallback: "Please try again." })
        );
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
        if (e?.message === "UNAUTHORIZED" || e?.status === 401) {
          onUnauthorized?.(e);
          return;
        }
        Alert.alert(
          "Failed to move to bin",
          getErrorMessage(e, { fallback: "Please try again." })
        );
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
        if (e?.message === "UNAUTHORIZED" || e?.status === 401) {
          onUnauthorized?.(e);
          return;
        }
        Alert.alert(
          "Failed to restore",
          getErrorMessage(e, { fallback: "Please try again." })
        );
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
