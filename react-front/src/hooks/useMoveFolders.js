// src/hooks/useMoveFolders.js
// Responsible for loading folders for the Move dialog.
// Pure data hook: no UI logic, no filtering, no assumptions.

import { useState, useCallback } from "react";
import { getMoveFolders } from "../api/apiClient";

export function useMoveFolders({ onUnauthorized } = {}) {
  const [folders, setFolders] = useState([]);
  const [status, setStatus] = useState("idle"); 
  // idle | loading | success | empty | error
  const [error, setError] = useState(null);

  const loadFolders = useCallback(
    async (parentId = null) => {
      setStatus("loading");
      setError(null);

      try {
        const data = await getMoveFolders(parentId);

        setFolders(data);
        setStatus(data.length === 0 ? "empty" : "success");
      } catch (err) {
        setStatus("error");
        setError(err);

        if (err?.status === 401 && onUnauthorized) {
          onUnauthorized(err);
        } else {
          throw err;
        }
      }
    },
    [onUnauthorized]
  );

  return {
    folders,
    status,
    error,
    loadFolders,
    setFolders, // exposed for controlled navigation / future extensions
  };
}
