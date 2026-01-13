// src/components/files/FilesContent.jsx
import FilesList from "../FilesList";

// Responsible ONLY for deciding what to display in the main content area
// No API calls, no side effects.

function FilesContent({
  // Search State
  searchActive,
  searchStatus,
  searchError,
  searchResults,

  // Files State
  filesStatus,
  filesError,
  files,

  // Actions
  onShare,
  onToggleStar,
  onMoveToBin,
  onRestore,
  onDeleteForever,
  isBinView,
  showOwner = false,
  showLastOpened = false,
  onMove,
  viewMode = "list",
  currentUserId = null,


  // Selection / Navigation
  isSelected,
  onSelect,
  onOpen,
  onRenameSuccess,

}) {
  // SAFE NORMALIZATION
  const safeFiles = Array.isArray(files) ? files : [];
  const safeSearchResults = Array.isArray(searchResults)
    ? searchResults
    : [];

  // SEARCH MODE
  if (searchActive) {
    return (
      <div>
        {searchStatus === "loading" && <p>Searching...</p>}

        {searchStatus === "error" && (
          <p>
            Search failed
            {process.env.NODE_ENV === "development" && searchError
              ? `: ${searchError}`
              : ""}
          </p>
        )}

        {searchStatus === "empty" && <p>No matching results</p>}

        {searchStatus === "success" && (
          <FilesList
            files={safeSearchResults}
            showOwner={showOwner}
            onOpenPermissions={onShare}
            onToggleStar={onToggleStar}
            onMoveToBin={onMoveToBin}
            onRestore={onRestore}
            onDeleteForever={onDeleteForever}
            isBinView={isBinView}
            isSelected={isSelected}
            onSelect={onSelect}
            onOpen={onOpen}
            onRenameSuccess={onRenameSuccess}
            showLastOpened={showLastOpened}
            viewMode={viewMode}
            onMove={onMove}
            currentUserId={currentUserId}
          />
        )}
      </div>
    );
  }

  // NORMAL FILES MODE
  return (
    <div>
      {filesStatus === "loading" && <p>Loading...</p>}

      {filesStatus === "error" && (
        <p>
          Failed to load files
          {process.env.NODE_ENV === "development" && filesError
            ? `: ${filesError.message}`
            : ""}
        </p>
      )}

      {filesStatus !== "loading" && safeFiles.length === 0 && (
      <div style={{ padding: 24, color: "var(--text-secondary)" }}>
          No items to display
      </div>
    )}

      {filesStatus === "success" && safeFiles.length > 0 && (
        <FilesList
          files={safeFiles}
          showOwner={showOwner}
          showLastOpened={showLastOpened}
          onOpenPermissions={onShare}
          onToggleStar={onToggleStar}
          onMoveToBin={onMoveToBin}
          onRestore={onRestore}
          onDeleteForever={onDeleteForever}
          isBinView={isBinView}
          isSelected={isSelected}
          onSelect={onSelect}
          onOpen={onOpen}
          onRenameSuccess={onRenameSuccess}
          onMove={onMove}
          viewMode={viewMode}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}

export default FilesContent;
