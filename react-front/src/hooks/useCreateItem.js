
import { useState, useMemo } from "react";
import { createItem } from "../api/apiClient";

/**
 * Hook responsible for creating files and folders.
 * - Supports empty files (like Google Drive)
 * - Supports full Unicode content (no ASCII restriction)
 * - Content validation is intentionally minimal
 */
export function useCreateItem({ onSuccess, onUnauthorized } = {}) {
  // State

  // "text" | "image" | "folder" | null
  const [type, setType] = useState(null);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const [nameError, setNameError] = useState("");
  const [contentError, setContentError] = useState("");
  const [createError, setCreateError] = useState("");

  // Used to avoid validation during IME composition (e.g., Hebrew, Japanese)
  const [isComposing, setIsComposing] = useState(false);

  const [parentId, setParentId] = useState(null);

  // Validation helpers

  /**
   * Validate item name.
   * Content is NOT validated here (Drive-like behavior).
   */
  function validateName(value) {
    if (!value.trim()) return "Name is required";

    // Disallow illegal filesystem characters
    if (/[\\/:*?"<>|]/.test(value)) {
      return 'Name cannot contain: \\ / : * ? " < > |';
    }

    // Prevent path traversal
    if (value.includes("..")) {
      return 'Name cannot contain ".."';
    }

    return "";
  }

  // Handlers

  function onNameChange(e) {
    const value = e.target.value;
    setName(value);

    // Avoid validating while IME is composing characters
    if (!isComposing) {
      setNameError(validateName(value));
    }
  }

  function onNameCompositionStart() {
    setIsComposing(true);
  }

  function onNameCompositionEnd(e) {
    setIsComposing(false);
    setNameError(validateName(e.target.value));
  }

  /**
   * Content change handler.
   * No character validation is applied:
   * - Unicode text is allowed
   * - Empty content is allowed
   * - Base64 (for images) is allowed
   */
  function onContentChange(e) {
    setContent(e.target.value);
    setContentError("");
  }

  // Derived state

  /**
   * Determines whether the form can be submitted.
   * Content never blocks submission (Drive behavior).
   */
  const canSubmit = useMemo(() => {
    if (!type) return false;
    if (!name.trim()) return false;
    if (nameError) return false;
    return true;
  }, [type, name, nameError]);

  // Actions

  /**
   * Initialize creation flow for a new item.
   */
  function startCreate(nextType, nextParentId = null) {
    setType(nextType);
    setParentId(nextParentId);

    setName("");
    setContent("");

    setNameError("Name is required");
    setContentError("");
    setCreateError("");

    setIsComposing(false);
  }

  /**
   * Cancel creation and reset state.
   */
  function cancelCreate() {
    setType(null);
    setName("");
    setContent("");
    setNameError("");
    setContentError("");
    setCreateError("");
    setIsComposing(false);
  }

  /**
   * Submit create request to backend.
   * Content is optional and may be empty.
   */
  async function submit() {
    setCreateError("");

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
        // Content is sent only for non-folder items
        ...(type !== "folder" ? { content } : {}),
      });

      cancelCreate();
      onSuccess?.();
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      setCreateError(err?.message || "Failed to create item");
    }
  }

  // Public API

  return {
    // state
    createType: type,
    name,
    content,
    nameError,
    contentError,
    createError,
    canSubmit,

    // handlers
    onNameChange,
    onNameCompositionStart,
    onNameCompositionEnd,
    onContentChange,

    // actions
    startCreate,
    cancelCreate,
    submit,
    setNameDirectly: (value) => {
      setName(value);
      setNameError(validateName(value));
    },
    setContentDirectly: setContent,
  };
}
