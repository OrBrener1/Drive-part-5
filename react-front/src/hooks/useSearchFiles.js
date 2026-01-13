// src/hooks/useSearchFiles.js
// Responsible for searching files.
// Holds search state and exposes search/clear actions.
// No UI, no auth handling, no routing.

import { useState, useMemo } from "react";
import { searchFiles } from "../api/apiClient";

export function useSearchFiles() {
  const [searchStatus, setSearchStatus] = useState("idle");
  // idle | loading | success | empty | error

  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [lastQuery, setLastQuery] = useState("");

  // Derived state: are we currently in "search mode"?
  const searchActive = useMemo(() => searchStatus !== "idle", [searchStatus]);

  async function search(query) {
    const q = String(query ?? "").trim();

    if (!q) {
      clearSearch();
      return;
    }

    setSearchStatus("loading");
    setSearchError("");
    setSearchResults([]);
    setLastQuery(q);

    try {
      const data = await searchFiles(q);

      if (!Array.isArray(data) || data.length === 0) {
        setSearchStatus("empty");
        setSearchResults([]);
      } else {
        setSearchStatus("success");
        setSearchResults(data);
      }
    } catch (err) {
      setSearchStatus("error");
      setSearchError(err?.message || "Search failed");
      setSearchResults([]);

      // Only rethrow auth-related errors so the page can logout/redirect.
      // Other errors are handled via state (searchError/searchStatus) for UI rendering.
      if (err?.message === "UNAUTHORIZED" || err?.status === 401) {
        throw err;
      }
    }
  }

  function clearSearch() {
    setSearchStatus("idle");
    setSearchError("");
    setSearchResults([]);
    setLastQuery("");
  }

  return {
    searchActive,
    searchStatus,
    searchError,
    searchResults,
    lastQuery,
    search,
    clearSearch,
  };
}
