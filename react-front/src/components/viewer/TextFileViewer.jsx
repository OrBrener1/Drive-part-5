import { useState, useEffect } from "react";
import "./TextFileViewer.css";

// Decode text content if it is a Base64 data URL
function decodeTextContent(content) {
  if (typeof content !== "string") {
    return "";
  }

  const prefix = "data:text/plain;base64,";
  if (!content.startsWith(prefix)) {
    return content;
  }

  try {
    const base64 = content.slice(prefix.length);
    return atob(base64);
  } catch {
    // Fallback: return original content if decoding fails
    return content;
  }
}

function TextFileViewer({ item, onBack, onSave }) {
const [text, setText] = useState(decodeTextContent(item.content));
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setText(decodeTextContent(item.content));
    setIsDirty(false);
  }, [item]);


  const handleChange = (e) => {
    setText(e.target.value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    await onSave(text);
    setIsDirty(false);
  };

  const handleCancel = () => {
    setText(item.content ?? "");
    setIsDirty(false);
  };

  return (
    <div className="text-viewer">
      <div className="text-toolbar">
        <button
          className="btn btn-ghost viewer-back"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>

        <div className="text-actions">
          {isDirty && (
            <>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                type="button"
              >
                Save
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleCancel}
                type="button"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <textarea
        className="text-editor"
        value={text}
        onChange={handleChange}
        placeholder="Start typing..."
      />
    </div>
  );
}

export default TextFileViewer;
