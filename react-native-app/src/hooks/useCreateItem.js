import { useState, useMemo } from "react";
import { createItem } from "../api/apiClient";

/**
 * React Native hook for creating files / folders.
 * - Drive-like behavior
 * - Unicode-safe
 * - Minimal validation
 */
export function useCreateItem({ onSuccess, onUnauthorized } = {}) {
  // "text" | "image" | "folder" | null
  const [type, setType] = useState(null);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const [nameError, setNameError] = useState("");
  const [createError, setCreateError] = useState("");

  const [parentId, setParentId] = useState(null);

  // --------------------
  // Validation
  // --------------------

  function validateName(value) {
    if (!value.trim()) return "Name is required";

    if (/[\\/:*?"<>|]/.test(value)) {
      return 'Name cannot contain: \\ / : * ? " < > |';
    }

    if (value.includes("..")) {
      return 'Name cannot contain ".."';
    }

    return "";
  }

  // --------------------
  // Handlers (RN style)
  // --------------------

  function onNameChange(value) {
    setName(value);
    setNameError(validateName(value));
  }

  function onContentChange(value) {
    setContent(value);
  }

  // --------------------
  // Derived state
  // --------------------

  const canSubmit = useMemo(() => {
    if (!type) return false;
    if (!name.trim()) return false;
    if (nameError) return false;
    return true;
  }, [type, name, nameError]);

  // --------------------
  // Actions
  // --------------------

  function startCreate(nextType, nextParentId = null) {
    setType(nextType);
    setParentId(nextParentId);

    setName("");
    setContent("");

    setNameError("Name is required");
    setCreateError("");
  }

  function cancelCreate() {
    setType(null);
    setName("");
    setContent("");
    setNameError("");
    setCreateError("");
  }

  async function submit() {
    const validationError = validateName(name);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    try {
      await createItem({
        name: name.trim(),
        type,
        parentId,
        ...(type !== "folder" ? { content } : {}),
      });

      cancelCreate();
      onSuccess?.();
    } catch (err) {
  if (onUnauthorized?.(err)) return;

  // CPP server down
  if (
    err?.message === "CPP_ERROR" ||
    err?.message === "File server unavailable" ||
    err?.status === 503
  ) {
    setCreateError("File server is unavailable. Please try again later.");
    return;
  }

  // Validation / permission / generic backend error
  if (err?.message) {
    setCreateError(err.message);
    return;
  }

  setCreateError("Failed to create item.");
}
  }

  // --------------------
  // Public API
  // --------------------

  return {
    // state
    createType: type,
    name,
    content,
    nameError,
    createError,
    canSubmit,

    // handlers
    onNameChange,
    onContentChange,

    // actions
    startCreate,
    cancelCreate,
    submit,
  };
}
