import "./FolderViewer.css";

function FolderViewer({ item, onBack }) {
  return (
    <div className="folder-viewer">
      <button className="viewer-back" onClick={onBack}>
        ← Back
      </button>

      <h3>{item.name}</h3>

      {item.children?.length === 0 && (
        <p className="empty-folder">This folder is empty</p>
      )}
    </div>
  );
}

export default FolderViewer;
