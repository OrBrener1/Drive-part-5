import TextFileViewer from "./TextFileViewer";
import ImageFileViewer from "./ImageFileViewer";
import FolderViewer from "./FolderViewer";

function FileViewer({ item, onBack, onSave }) {
  if (!item) return null;

  switch (item.type) {
    case "file":
      if (item.contentType === "image") {
        return <ImageFileViewer item={item} onBack={onBack} />;
      }
      return <TextFileViewer item={item} onBack={onBack} onSave={onSave} />;

    case "folder":
      return <FolderViewer item={item} onBack={onBack} />;

    default:
      return (
        <div>
          <button onClick={onBack}>Back</button>
          <p>Unsupported item type</p>
        </div>
      );
  }
}

export default FileViewer;
