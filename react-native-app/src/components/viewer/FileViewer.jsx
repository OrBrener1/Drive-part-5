import TextFileViewer from "./TextFileViewer";
import ImageFileViewer from "./ImageFileViewer";

export default function FileViewer({ item, onRefresh }) {
  console.log("FILE VIEWER ITEM", item.type, item.contentType, item.name);

  if (item.type === "file" && item.contentType === "image") {
    console.log("ENTER IMAGE VIEWER");
    return <ImageFileViewer item={item} onRefresh={onRefresh} />;
  }

  // default: text file
  return <TextFileViewer item={item} />;
}
