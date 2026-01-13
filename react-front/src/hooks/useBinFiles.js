// src/hooks/useBinFiles.js
// Responsible for loading files from the user's Bin.
// Pure data hook: no UI logic, no filtering, no file shape assumptions.

import { useState, useCallback } from "react";
import { getBinFiles } from "../api/apiClient";

export function useBinFiles({ onUnauthorized } = {}) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | empty | error
  const [error, setError] = useState(null);

  const loadBinFiles = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const data = await getBinFiles();

      setFiles(data);
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
  }, [onUnauthorized]);

  return {
    files,
    status,
    error,
    loadBinFiles,
    setFiles, // exposed for optimistic UI updates (restore / delete)
  };
}
