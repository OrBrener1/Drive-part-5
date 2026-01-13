
import { useState, useMemo } from "react";
import { updateFile } from "../api/apiClient";

/**
 * Hook responsible for renaming an existing file or folder.
 * Mimics Google Drive rename behavior.
 */
export function useRenameItem({ itemId, initialName, onSuccess, onUnauthorized }) {
  // State

  const [name, setName] = useState(initialName || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation

  function validateName(value) {
    if (!value.trim()) return "Name is required";

    // Prevent logical path traversal
    if (value.includes("..")) {
      return 'Name cannot contain ".."';
    }

    // Disallow illegal filesystem characters (Drive-like behavior)
    if (/[\\/:*?"<>|]/.test(value)) {
      return 'Name cannot contain: \\ / : * ? " < > |';
    }

    return "";
  }

  // Derived state

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (error) return false;
    if (name === initialName) return false; // No-op rename
    return true;
  }, [name, error, initialName]);

  // Handlers

  function onNameChange(e) {
    const value = e.target.value;
    setName(value);
    setError(validateName(value));
  }

  async function submit() {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await updateFile(itemId, { name: name.trim() });
      onSuccess?.(name.trim());
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      setError(err?.message || "Rename failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Public API

  return {
    name,
    error,
    canSubmit,
    isSubmitting,
    onNameChange,
    submit,
  };
}
