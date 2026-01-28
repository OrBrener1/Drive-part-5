// React hook for Files state and actions.

import { useCallback, useState } from "react";
import { getFiles } from "../api/filesApi";

export function useFiles(parentId = null) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);

  const addFile = useCallback(
    (item) => {
      if (!item) return;
      const itemParent = item?.parentId ?? null;
      const currentParent = parentId ?? null;
      if (String(itemParent ?? "") !== String(currentParent ?? "")) return;
      setFiles((prev) => {
        const exists = prev.some((f) => String(f.id) === String(item.id));
        return exists ? prev : [item, ...prev];
      });
    },
    [parentId]
  );

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

  return { files, status, error, loadFiles, addFile };
}

