// Reusable UI component: File Viewer.

import TextFileViewer from "./TextFileViewer";
import ImageFileViewer from "./ImageFileViewer";

export default function FileViewer({ item, onRefresh }) {

  if (item.type === "file" && item.contentType === "image") {
    return <ImageFileViewer item={item} onRefresh={onRefresh} />;
  }

  // default: text file
  return <TextFileViewer item={item} />;
}
