import { useState, useCallback } from "react";
import { getFileById } from "../api/apiClient";

/**
 * Handles opening a file or folder by id.
 * Pure logic: no UI, no routing.
 */
export function useOpenItem({ onUnauthorized }={}) {
  const [status, setStatus] = useState("idle");
  const [item, setItem] = useState(null); // opened item data
  const [error, setError] = useState(null);

  const openItem = useCallback(async (id) => {
    setStatus("loading");
    setError(null);

    try {
      const data = await getFileById(id);
      setItem(data);
      setStatus("success");
    } catch (err) {
      if (err.status === 401 && onUnauthorized) {
        onUnauthorized(err);
        return;
      }

      setError(err.message || "Failed to open item");
      setStatus("error");
    }
  }, [onUnauthorized]);

  const closeItem = useCallback(() => {
    setItem(null);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    status,
    item,
    setItem,
    error,
    openItem,
    closeItem,
  };
}
