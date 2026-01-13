import { useNavigate } from "react-router-dom";
import UserAvatar from "./userAvatarMenu/UserAvatar";
import "./FileItem.css";

function FileItem({
  item,
  showOwner = false,
  showLastOpened = false,
  selected,
  onSelect,
  onOpen,
  onOpenContextMenu,
  onToggleStar,
  isStarred = false, // derived outside, not from item itself
  viewMode = "list",
}) {
  const kind =
    item.type === "folder"
      ? "folder"
      : item.contentType === "image"
        ? "image"
        : "text";
  const navigate = useNavigate();

  const ownerName = item.ownerName || item.ownerEmail || item.ownerLabel || "-";
  const lastOpenedText =
    item.lastOpened && !Number.isNaN(Date.parse(item.lastOpened))
      ? new Date(item.lastOpened).toLocaleString()
      : "-";

  function openMenuAtEvent(e) {
    if (!onOpenContextMenu) return;
    e.preventDefault();
    e.stopPropagation();
    onOpenContextMenu(item, { x: e.clientX, y: e.clientY });
  }

  function handleClick(e) {
    e.stopPropagation();
    onSelect?.(item.id);
  }

  function handleDoubleClick(e) {
    e.stopPropagation();
    if (onOpen) {
      onOpen(item);
      return;
    }
    if (item.type === "folder") {
      navigate(`/files/${item.id}`);
      return;
    }
    navigate(`/files/${item.id}/view`);
  }

  return (
    <li
      className={`fileItem fileItem-${kind} ${selected ? "selected" : ""} ${viewMode === "grid" ? "grid" : ""}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={openMenuAtEvent}
    >
      {viewMode === "grid" ? (
        <>
          <div className="fileHeader">
            <div className="fileHeaderLeft">
              <span className={`fileIcon fileIcon-${kind} fileIconSmall`} aria-hidden="true" />
              <span className="fileName">{item.name}</span>
            </div>

            <div className="fileActions">
              {onToggleStar && (
                <button
                  type="button"
                  className={`iconButton starButton ${isStarred ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(item.id);
                  }}
                  aria-label="toggle star"
                  title={isStarred ? "Remove star" : "Add star"}
                >
                  <span
                    className={`starIcon ${isStarred ? "starIconFilled" : "starIconOutline"}`}
                    aria-hidden="true"
                  />
                </button>
              )}

              <button
                aria-label="More"
                className="iconButton moreButton"
                onClick={openMenuAtEvent}
                type="button"
              >
                ...
              </button>
            </div>
          </div>

          <div className="filePreview">
            <span className={`filePreviewIcon fileIcon fileIcon-${kind} fileIconLarge`} aria-hidden="true" />
          </div>

          <div className="fileMetaRow grid">
            <div className="fileMetaGrid">
              <div className="ownerInfo">
                <UserAvatar
                  user={{ displayName: ownerName, image: item.ownerImage || null }}
                  className="owner-avatar"
                />
                <span className="fileMeta">{ownerName}</span>
              </div>
              <span className="fileMeta">{lastOpenedText}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="fileRow">
          <div className="fileCol fileColName">
            <span className={`fileIcon fileIcon-${kind} fileIconSmall`} aria-hidden="true" />
            <span className="fileName">{item.name}</span>
          </div>

          <div className="fileCol fileColOwner">
            <div className="ownerInfo">
              <UserAvatar
                user={{ displayName: ownerName, image: item.ownerImage || null }}
                className="owner-avatar"
              />
              <span className="fileMeta">{ownerName}</span>
            </div>
          </div>

          <div className="fileCol fileColLastOpened">
            <span className="fileMeta">{lastOpenedText}</span>
          </div>

          <div className="fileActions">
            {onToggleStar && (
              <button
                type="button"
                className={`iconButton starButton ${isStarred ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(item.id);
                }}
                aria-label="toggle star"
                title={isStarred ? "Remove star" : "Add star"}
              >
                <span
                  className={`starIcon ${isStarred ? "starIconFilled" : "starIconOutline"}`}
                  aria-hidden="true"
                />
              </button>
            )}

            <button
              aria-label="More"
              className="iconButton moreButton"
              onClick={openMenuAtEvent}
              type="button"
            >
              ...
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default FileItem;
