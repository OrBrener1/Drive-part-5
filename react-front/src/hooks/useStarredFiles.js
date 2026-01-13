import { useCallback, useEffect, useState } from "react";
import { getStarredFiles } from "../api/apiClient";


export default function useStarredFiles() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);

  const loadStarredFiles = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const data = await getStarredFiles();
      setFiles(data);
      setStatus("success");
    } catch (err) {
      setError(err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadStarredFiles();
  }, [loadStarredFiles]);

  return {
    files,
    status,
    error,
    reload: loadStarredFiles,
    setFiles,
  };
}
