// React hook for Starred Files state and actions.

import { useCallback, useState } from "react";
import { getStarredFiles } from "../api/filesApi";

export function useStarredFiles() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const loadFiles = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const data = await getStarredFiles();
      setFiles(Array.isArray(data) ? data : []);
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setError(e);
      throw e;
    }
  }, []);

  return { files, status, error, loadFiles };
}
