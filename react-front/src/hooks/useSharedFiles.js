import { useCallback, useEffect, useState } from "react";
import { getSharedFiles } from "../api/apiClient";

// Loads "shared with me" items for the current user
export default function useSharedFiles({ onUnauthorized } = {}) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);

  const loadSharedFiles = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const data = await getSharedFiles();
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
    loadSharedFiles();
  }, [loadSharedFiles]);

  return {
    files,
    status,
    error,
    reload: loadSharedFiles,
    setFiles,
  };
}
