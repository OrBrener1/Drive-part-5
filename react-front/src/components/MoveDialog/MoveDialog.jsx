// src/components/MoveDialog/MoveDialog.jsx

import { useEffect, useState } from "react";
import { useMoveFolders } from "../../hooks/useMoveFolders";
import { useMoveActions } from "../../hooks/useMoveActions";
import { getStarredFiles } from "../../api/apiClient";
import "./MoveDialog.css";

export default function MoveDialog({ isOpen, item, onClose, onMoved }) {
  const { folders, status, loadFolders } = useMoveFolders();
  const { moveItem } = useMoveActions();

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [activeTab, setActiveTab] = useState("locations");
  const [starredFolders, setStarredFolders] = useState([]);

  function getParentName(fullPath) {
    if (!fullPath) return "Current folder";
    const parts = fullPath.split("/").filter(Boolean);
    if (parts.length < 2) return "My Drive";
    return parts[parts.length - 2];
  }

  // Load root folders when dialog opens
  useEffect(() => {
    if (isOpen) {
      const parentId = item?.parentId ?? null;
      if (parentId) {
        setBreadcrumbs([
          { id: null, name: "My Drive" },
          { id: parentId, name: getParentName(item?.fullPath) },
        ]);
        loadFolders(parentId);
      } else {
        setBreadcrumbs([{ id: null, name: "My Drive" }]);
        loadFolders(null);
      }
      setSelectedFolderId(null);

      getStarredFiles()
        .then(files => {
          const onlyFolders = files.filter(f => f.type === "folder");
          setStarredFolders(onlyFolders);
        })
        .catch(() => {
          setStarredFolders([]);
        });
    }
  }, [isOpen, item, loadFolders]);

const displayedFolders =
  activeTab === "starred"
    ? starredFolders
    : folders;


  if (!isOpen) {
    return null;
  }

  // Enter folder (double click)
  const enterFolder = (folder) => {
  setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  setSelectedFolderId(null);
  loadFolders(folder.id);
};

  // Go back
  const goBack = () => {
  const newCrumbs = breadcrumbs.slice(0, -1);
  const last = newCrumbs[newCrumbs.length - 1] ?? null;

  setBreadcrumbs(newCrumbs);
  setSelectedFolderId(null);
  loadFolders(last?.id ?? null);
};
  const canMove =
  selectedFolderId !== null || breadcrumbs.length === 1;

  // Confirm move
  const handleMove = async () => {
  try {
    const targetParentId = selectedFolderId !== null ? selectedFolderId : null; // null = My Drive
    await moveItem(item.id, targetParentId);
    onMoved?.();
    onClose();
  } catch (err) {
    alert("Failed to move item");
  }
};

  return (
  <div className="move-dialog-overlay">
    <div className="move-dialog">

      {/* ================= Header ================= */}
      <div className="move-dialog-header">
        <h3>Move "{item.name}"</h3>
      </div>
      {/* ================= Body ================= */}
          <div className="move-dialog-body">

            {/* -------- Current location -------- */}
            <div className="move-dialog-location">
              <span className="location-label">Current location:</span>
              <span className="location-pill">
                {breadcrumbs.map(b => b.name).join(" / ")}
              </span>
            </div>

            {/* -------- Tabs -------- */}
            <div className="move-dialog-tabs">
              <button
                className={activeTab === "locations" ? "active" : ""}
                onClick={() => setActiveTab("locations")}
              >
                My locations
              </button>

              <button
                className={activeTab === "starred" ? "active" : ""}
                onClick={() => setActiveTab("starred")}
              >
                Starred
              </button>
            </div>

            {/* -------- Back (only in My locations) -------- */}
            {breadcrumbs.length > 1 && (
              <button
                className="move-dialog-back"
                onClick={goBack}
              >

                ← Back
              </button>
            )}

            {/* -------- Folder list -------- */}
            {status === "loading" && <p>Loading folders...</p>}
            {status === "empty" && <p>No folders here</p>}

            {status === "success" && (
              <ul className="move-dialog-list">
                {displayedFolders.map((folder) => {
                  const disabled = folder.id === item.id;

                  return (
                    <li
                      key={folder.id}
                      className={`move-dialog-item ${
                        selectedFolderId === folder.id ? "selected" : ""
                      } ${disabled ? "disabled" : ""}`}
                      onClick={() => {
                        if (!disabled) {
                          setSelectedFolderId(folder.id);
                        }
                      }}
                      onDoubleClick={() => {
                        if (!disabled) {
                          enterFolder(folder);
                        }
                      }}
                    >
                      📁 {folder.name}
                    </li>
                  );
                })}
              </ul>
            )}

          </div>

          {/* ================= Footer ================= */}
          <div className="move-dialog-footer">
            <button onClick={onClose}>Cancel</button>
            <button
              onClick={handleMove}
              disabled={!canMove}
            >
              Move
            </button>
          </div>
    </div>
  </div>
);
}
