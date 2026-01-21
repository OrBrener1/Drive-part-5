import { useCallback, useState } from "react";
import { getFiles } from "../api/filesApi";

export function useFiles(parentId = null) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);

  const loadFiles = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const data = await getFiles(parentId);
      setFiles(Array.isArray(data) ? data : []);
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setError(e);
      throw e;
    }
  }, [parentId]);

  return { files, status, error, loadFiles };
}

