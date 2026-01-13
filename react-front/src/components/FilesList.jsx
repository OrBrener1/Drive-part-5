import { useMemo, useState, useCallback } from "react";
import FileItem from "./FileItem";
import ContextMenu from "./contextMenu/ContextMenu";
import RenameModal from "./RenameModal";
import "./FilesList.css";

// download imports
import { downloadFileRaw } from "../api/apiClient";
import { downloadFile } from "../utils/downloadFile";

// Renders a list of files/folders.
// Pure UI component: builds the context menu based on the current view only.
function FilesList({
  files,
  onOpenPermissions,
  onToggleStar,
  onMoveToBin,
  onRestore,
  onDeleteForever,
  isBinView,
  isSelected,
  onSelect,
  onOpen,
  showOwner = false,
  onRenameSuccess,
  showLastOpened = false,
  viewMode = "list",
  onMove,
  currentUserId = null,
}) {
  const [ctxOpen, setCtxOpen] = useState(false);
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });
  const [ctxItem, setCtxItem] = useState(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameItem, setRenameItem] = useState(null);

  // Close context menu
  const closeCtx = useCallback(() => {
    setCtxOpen(false);
    setCtxItem(null);
  }, []);

  // Open context menu on right-click / ⋮
  const openCtx = useCallback((item, pos) => {
    setCtxItem(item);
    setCtxPos({ x: pos.x, y: pos.y });
    setCtxOpen(true);
  }, []);

  // Build context menu items based on current view (bin / non-bin)
  const menuItems = useMemo(() => {
    if (!ctxItem) return [];

    const items = [];

    // Download (FILES ONLY, non-bin)
    if (!isBinView && ctxItem.type === "file") {
      items.push({
        key: "download",
        label: "⬇ Download",
        onClick: async () => {
          try {
            const blob = await downloadFileRaw(ctxItem.id);
            downloadFile(blob, ctxItem.name);
          } catch (err) {
            console.error("Download failed", err);
            alert("Failed to download file");
          } finally {
            closeCtx();
          }
        },
      });
    }

    const canMoveItem =
      !!onMove &&
      !isBinView &&
      (!ctxItem?.ownerId ||
        !currentUserId ||
        Number(ctxItem.ownerId) === Number(currentUserId));

    // Rename (non-bin only)
    if (!isBinView) {
      items.push({
        key: "rename",
        label: "Rename",
        iconClass: "ctxIcon-rename",
        onClick: () => {
          setRenameItem(ctxItem);
          setRenameOpen(true);
          closeCtx();
        },
      });
    }

    // Permissions
    items.push({
      key: "permissions",
      label: "👥 Permissions",
      onClick: () => {
        onOpenPermissions?.(ctxItem);
        closeCtx();
      },
    });
    // Move (non-bin only)
    if (canMoveItem) {
      items.push({
        key: "move",
        label: "⇄ Move",
        onClick: () => {
          onMove?.(ctxItem);
          closeCtx();
        },
      });
    }

    // Non-bin → Move to bin
    if (!isBinView && onMoveToBin) {
      items.push({
        key: "move_to_bin",
        label: "🗑️ Move to bin",
        onClick: () => {
          onMoveToBin(ctxItem.id);
          closeCtx();
        },
      });
    }

    // Bin → Restore
    if (isBinView && onRestore) {
      items.push({
        key: "restore",
        label: "♻️ Restore",
        onClick: () => {
          onRestore(ctxItem.id);
          closeCtx();
        },
      });
    }

    // Bin → Delete forever
    if (isBinView && onDeleteForever) {
      items.push({
        key: "delete_forever",
        label: "❌ Delete forever",
        onClick: () => {
          onDeleteForever(ctxItem.id);
          closeCtx();
        },
      });
    }

    return items;
  }, [
    ctxItem,
    isBinView,
    onOpenPermissions,
    onMoveToBin,
    onRestore,
    onDeleteForever,
    closeCtx,
    onMove,
  ]);

  return (
    <>
      <div className="filesListWrap">
        {viewMode !== "grid" && files.length > 0 && (
          <div className="filesHeader" aria-label="Files header">
            <div className="filesHeaderCell">Name</div>

            <div className="filesHeaderCell">Owner</div>
            <div className="filesHeaderCell">Last opened</div>
            <div className="filesHeaderCell filesHeaderActions" aria-hidden="true" />
          </div>
        )}

        <ul className={`filesList ${viewMode === "grid" ? "filesListGrid" : ""}`}>
          {files.map((item) => (
            <FileItem
              key={item.id}
              item={item}
              showOwner={showOwner}
              showLastOpened={showLastOpened}
              selected={isSelected ? isSelected(item.id) : false}
              onSelect={onSelect}
              onOpen={onOpen}
              onToggleStar={onToggleStar}
              onOpenContextMenu={openCtx}
              isStarred={item._isStarred}
              viewMode={viewMode}
            />
          ))}
        </ul>
      </div>

      <ContextMenu
        isOpen={ctxOpen}
        x={ctxPos.x}
        y={ctxPos.y}
        items={menuItems}
        onClose={closeCtx}
      />

      {renameOpen && renameItem && (
        <RenameModal
          itemId={renameItem.id}
          initialName={renameItem.name}
          onClose={() => {
            setRenameOpen(false);
            setRenameItem(null);
          }}
          onSuccess={(newName) => {
            onRenameSuccess?.(renameItem.id, newName);
            setRenameOpen(false);
            setRenameItem(null);
          }}
        />
      )}
    </>
  );
}

export default FilesList;
