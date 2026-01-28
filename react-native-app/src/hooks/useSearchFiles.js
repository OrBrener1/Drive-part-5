// React hook for Search Files state and actions.

import { useEffect, useState } from "react";
import { searchFiles } from "../api/filesApi";

export function useSearchFiles(query) {
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = String(query ?? "").trim();
    if (!q) {
      setResults([]);
      setStatus("idle");
      setError(null);
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setError(null);

    const timeoutId = setTimeout(() => {
      searchFiles(q)
        .then((data) => {
          if (cancelled) return;
          setResults(Array.isArray(data) ? data : []);
          setStatus("success");
        })
        .catch((err) => {
          if (cancelled) return;
          setStatus("error");
          setError(err);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  return { results, status, error };
}
