// src/pages/FileViewerPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import FileViewer from "../components/viewer/FileViewer";
import { useOpenItem } from "../hooks/useOpenItem";
import { patchFileById } from "../api/apiClient";

function FileViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // We do not use `error` here → do not destructure it
  const { item, status, openItem } = useOpenItem();

  useEffect(() => {
    if (id) {
      openItem(id);
    }
  }, [id, openItem]);

  // Save handler: calls existing PATCH endpoint
  const handleSave = async (newContent) => {
    if (!item) return;
    await patchFileById(item.id, newContent);
  };

  if (status === "loading") return <p>Loading file...</p>;
  if (status === "error") return <p>Failed to open file</p>;
  if (!item) return null;

  return (
    <FileViewer
      item={item}
      onBack={() => navigate(-1)}
      onSave={handleSave}
    />
  );
}

export default FileViewerPage;
