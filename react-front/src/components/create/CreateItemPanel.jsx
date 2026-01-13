import { useEffect, useState } from "react";
import "./CreateItemPanel.css";

function CreateItemPanel({
  type,
  name,
  content,
  nameError,
  contentError,
  createError,
  canSubmit,
  onNameChange,
  onNameCompositionStart,
  onNameCompositionEnd,
  onContentChange,
  onSubmit,
  onCancel,
  selectedItem,
}) {
  // Hooks MUST be first
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    if (!selectedItem || !selectedItem.type || !selectedItem.type.startsWith("image/")) {
      setPreviewUrl(null);
      setImageReady(false);
      return;
    }

    const url = URL.createObjectURL(selectedItem);
    setPreviewUrl(url);
    setImageReady(false);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedItem]);

  // Conditional render AFTER hooks
  if (!type) return null;

  const isUpload = Boolean(selectedItem);
  const isImageUpload = Boolean(
    selectedItem && selectedItem.type && selectedItem.type.startsWith("image/")
  );
  const title = isUpload ? "Upload File" : `Create new ${type}`;
  const namePlaceholder = isUpload
    ? "Enter file name"
    : `Enter ${type} name`;
  const primaryLabel = isUpload ? "Upload" : "Create";

  return (
    <div className="create-panel">
      <div className="create-panel-body">
        <h3>{title}</h3>

        <input
          type="text"
          placeholder={namePlaceholder}
          value={name}
          onChange={onNameChange}
          onCompositionStart={onNameCompositionStart}
          onCompositionEnd={onNameCompositionEnd}
        />
        {nameError && <p className="error-text">{nameError}</p>}

        {isImageUpload && previewUrl && (
          <div className="create-image-preview">
            {!imageReady && <div className="create-image-placeholder" />}

            <img
              className="create-image-preview-img"
              src={previewUrl}
              alt="preview"
              onLoad={() => setImageReady(true)}
              style={{ display: imageReady ? "block" : "none" }}
            />
          </div>
        )}

        {type === "file" && !selectedItem && (
          <>
            <textarea
              placeholder="Content"
              value={content}
              onChange={onContentChange}
              rows={4}
              className="file-content-textarea"
            />
            {contentError && <p className="error-text">{contentError}</p>}
          </>
        )}

        {createError && <p className="error-text">{createError}</p>}
      </div>

      <div className="create-actions">
        <button
          disabled={!canSubmit}
          className="btn btn-primary"
          onClick={onSubmit}
          type="button"
        >
          {primaryLabel}
        </button>

        <button
          className="btn btn-ghost"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CreateItemPanel;
