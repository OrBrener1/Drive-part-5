import { useCallback } from "react";
import { toggleStar } from "../api/apiClient";

export default function useToggleStar({ onOptimistic, onSuccess, onError }) {
  const toggle = useCallback(
    async (itemId) => {
      const rollback = onOptimistic?.(itemId);
      try {
        await toggleStar(itemId);
        onSuccess?.(itemId);
      } catch (err) {
        if (rollback) rollback();
        onError?.(err, itemId);
        throw err;
      }
    },
    [onOptimistic, onSuccess, onError]
  );

  return { toggle };
}
