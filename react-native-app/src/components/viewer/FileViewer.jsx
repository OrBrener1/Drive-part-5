import TextFileViewer from "./TextFileViewer";
import ImageFileViewer from "./ImageFileViewer";

export default function FileViewer({ item }) {
  if (item.type === "image") {
    return <ImageFileViewer item={item} />;
  }

  // default: text file
  return <TextFileViewer item={item} />;
}
