import React, { useEffect, useRef } from "react";
import { useRenameItem } from "../hooks/useRenameItem";
import "./RenameModal.css";

/**
 * Rename modal dialog.
 * Opens centered on screen, mimics Google Drive behavior.
 */
export default function RenameModal({
  itemId,
  initialName,
  onClose,
  onSuccess,
  onUnauthorized,
}) {
  const inputRef = useRef(null);

  const {
    name,
    error,
    canSubmit,
    isSubmitting,
    onNameChange,
    submit,
  } = useRenameItem({
    itemId,
    initialName,
    onSuccess: (newName) => {
    onSuccess?.(newName);   
    onClose();
  },
    onUnauthorized,
  });

  // Focus and select text when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Keyboard shortcuts:
  // Enter = confirm
  // Escape = cancel
  function handleKeyDown(e) {
    if (e.key === "Enter" && canSubmit) {
      submit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal rename-modal">
        <h3>Rename</h3>
        <div className="rename-input-wrapper">
        <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={onNameChange}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
        />
        </div>
        {error && <div className="error-text">{error}</div>}

        <div className="modal-actions">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={!canSubmit || isSubmitting}
            type="button"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
