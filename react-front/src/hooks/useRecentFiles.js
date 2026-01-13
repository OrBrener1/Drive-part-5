import { useCallback, useEffect, useState } from "react";
import { getRecentFiles } from "../api/apiClient";

// Loads recent files (ordered by lastOpened) for the current user.
export default function useRecentFiles({ onUnauthorized } = {}) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);

  const loadRecentFiles = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const data = await getRecentFiles();
      setFiles(data);
      setStatus("success");
    } catch (err) {
      if (err.status === 401 && onUnauthorized) {
        onUnauthorized(err);
        return;
      }
      setError(err);
      setStatus("error");
    }
  }, [onUnauthorized]);

  useEffect(() => {
    loadRecentFiles();
  }, [loadRecentFiles]);

  return {
    files,
    status,
    error,
    reload: loadRecentFiles,
  };
}
