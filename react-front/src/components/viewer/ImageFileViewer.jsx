import "./ImageFileViewer.css";
import { useRef, useState, useEffect} from "react";
import { replaceFile } from "../../api/apiClient";


function ImageFileViewer({ item, onBack }) {
  const fileInputRef = useRef(null);
  const [imageVersion, setImageVersion] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

    const imageSrc = previewUrl ?? `data:image/*;base64,${item.content}`;

// Handle replacing the current image with a new one
async function handleReplaceImage(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  // Reset input so the same file can be selected again
  e.target.value = "";

  // Show immediate preview
  const nextPreviewUrl = URL.createObjectURL(file);
  setPreviewUrl((prev) => {
    if (prev) URL.revokeObjectURL(prev);
    return nextPreviewUrl;
  });

  try {
    await replaceFile(item.id, file);

    // Force re-mount of the <img> element
    setImageVersion((v) => v + 1);

    // Keep preview until user navigates away or refreshes item
  } catch (err) {
    console.error("Replace image failed", err);
  }
}


// Cleanup preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);



  return (
    <div className="image-viewer">
      <div className="image-toolbar">
        <button
          className="btn btn-ghost viewer-back"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>

        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Replace Image
        </button>

      </div>

      <img
        key={imageVersion}
        src={imageSrc}
        alt={item.name}
        className="image-viewer-img"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleReplaceImage}
      />
    </div>
  );
}

export default ImageFileViewer;
