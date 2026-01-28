// React hook for File Actions state and actions.

import { useCallback } from "react";
import { Alert } from "react-native";
import {
  moveFileToBin,
  restoreFileFromBin,
  toggleStar,
  deleteFileForever,
} from "../api/filesApi";
import { getErrorMessage } from "../utils/errorMessages";

export function useFileActions({ loadFiles } = {}) {
  const handleToggleStar = useCallback(
    async (item) => {
      try {
        await toggleStar(item.id);
        await loadFiles?.();
      } catch (e) {
        Alert.alert(
          "Failed to update star",
          getErrorMessage(e, { fallback: "Please try again." })
        );
      }
    },
    [loadFiles]
  );

  const handleMoveToBin = useCallback(
    async (item) => {
      try {
        await moveFileToBin(item.id);
        await loadFiles?.();
      } catch (e) {
        Alert.alert(
          "Failed to move to bin",
          getErrorMessage(e, { fallback: "Please try again." })
        );
      }
    },
    [loadFiles]
  );

  const handleRestoreFromBin = useCallback(
    async (item) => {
      try {
        await restoreFileFromBin(item.id);
        await loadFiles?.();
      } catch (e) {
        Alert.alert(
          "Failed to restore",
          getErrorMessage(e, { fallback: "Please try again." })
        );
      }
    },
    [loadFiles]
  );

  const handleDeleteForever = useCallback(
    async (item) => {
      try {
        await deleteFileForever(item.id);
        await loadFiles?.();
      } catch (e) {
        Alert.alert(
          "Failed to delete",
          getErrorMessage(e, { fallback: "Please try again." })
        );
      }
    },
    [loadFiles]
  );

  return {
    handleToggleStar,
    handleMoveToBin,
    handleRestoreFromBin,
    handleDeleteForever,
  };
}
