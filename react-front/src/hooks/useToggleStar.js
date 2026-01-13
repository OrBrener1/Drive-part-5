import { useCallback } from "react";
import { toggleStar } from "../api/apiClient";

export default function useToggleStar({ onSuccess }) {
  const toggle = useCallback(
    async (itemId) => {
      await toggleStar(itemId);
      onSuccess?.();
    },
    [onSuccess]
  );

  return { toggle };
}