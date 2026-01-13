// useFiles
// Responsible for loading and managing the user's files list.
// No UI, no routing, no auth side-effects.

import { useState, useCallback } from "react";
import { getFiles } from "../api/apiClient";

export function useFiles() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | empty | error
  const [error, setError] = useState(null);

  const loadFiles = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const data = await getFiles();
      setFiles(data);
      setStatus(data.length === 0 ? "empty" : "success");
    } catch (err) {
      setStatus("error");
      setError(err);
      throw err; // Let FilesPage decide how to react (auth, redirect, etc.)
    }
  }, []);

  return {
    files,
    setFiles,
    status,
    error,
    loadFiles,
  };
}
