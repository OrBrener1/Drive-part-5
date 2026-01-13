import { useEffect, useRef } from "react";
import "./CreateMenu.css";

/**
 * CreateMenu
 * UI-only dropdown for creating items.
 * Upload file = open native file picker (no upload yet).
 */
function CreateMenu({
  isOpen,
  onOpen,
  onClose,
  onStartCreateFile,
  onStartCreateFolder,
  onUploadFile,
  disabled = false,
}) {
  const rootRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Trigger native file picker
  function handleUploadClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  // Handle selected file (upload)
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Reset input so same file can be selected again later
    e.target.value = "";

    if (onUploadFile) {
      onUploadFile(file);
    }
  }

  return (
    <div ref={rootRef} className="createMenu">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,text/plain,.txt"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={isOpen ? onClose : onOpen}
        disabled={disabled}
        className="btn createMenuTrigger"
      >
        + New
      </button>

      {isOpen && !disabled && (
        <div className="createMenuPanel">
          <button
            type="button"
            className="createMenuItem"
            onClick={() => {
              onStartCreateFile();
              onClose();
            }}
          >
            <span className="createMenuItemContent">
              <span
                className="createMenuIcon createMenuIcon-text"
                aria-hidden="true"
              />
              <span>New File</span>
            </span>
          </button>

          <button
            type="button"
            className="createMenuItem"
            onClick={() => {
              onStartCreateFolder();
              onClose();
            }}
          >
            <span className="createMenuItemContent">
              <span
                className="createMenuIcon createMenuIcon-folder"
                aria-hidden="true"
              />
              <span>New Folder</span>
            </span>
          </button>

          <button
            type="button"
            className="createMenuItem"
            onClick={() => {
              handleUploadClick();
              onClose();
            }}
          >
            <span className="createMenuItemContent">
              <span
                className="createMenuIcon createMenuIcon-upload"
                aria-hidden="true"
              />
              <span>Upload File</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateMenu;
