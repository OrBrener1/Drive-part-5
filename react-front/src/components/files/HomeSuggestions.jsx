import "./HomeSuggestions.css";

function Section({ title, items, status, emptyText, renderList }) {
  if (status === "loading" || status === "idle") {
    return (
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>{emptyText}</p>
      ) : (
        renderList(items)
      )}
    </section>
  );
}

export default function HomeSuggestions({
  status,
  error,
  folders,
  files,
  viewMode = "list",
  onViewModeChange,
  isInfoOpen = false,
  onToggleInfo,
  onSelect,
  onToggleStar,
  onShare,
  onRenameSuccess,
  onOpen,
  onMoveToBin,
  onRestore,
  onDeleteForever,
  onMove,
  isSelected,
  currentUserId = null,
  showOwner = true,
  showLastOpened = true,
  renderListComponent: ListComponent,
}) {
  if (status === "error") {
    return <p>Failed to load recent items{error ? `: ${error.message || error}` : ""}</p>;
  }

  const renderList = (items) => (
    <ListComponent
      files={items}
      showOwner={showOwner}
      showLastOpened={showLastOpened}
      onOpenPermissions={onShare}
      onToggleStar={onToggleStar}
      onMoveToBin={onMoveToBin}
      onRestore={onRestore}
      onDeleteForever={onDeleteForever}
      onRenameSuccess={onRenameSuccess}
      isSelected={isSelected}
      onSelect={onSelect}
      onMove={onMove}
      currentUserId={currentUserId}
      viewMode={viewMode}
      onOpen={onOpen}
    />
  );

  return (
    <div style={{ padding: "12px 0" }}>
      <div className="home-header">
        <div>
          <h2 style={{ margin: 0 }}>Welcome!</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-secondary)" }}>
            Suggestions based on your recent activity
          </p>
        </div>
        <div className="header-actions">
          <div className="view-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              onClick={() => onViewModeChange?.("list")}
              aria-pressed={viewMode === "list"}
              aria-label="List view"
              className={`view-toggle-btn ${viewMode === "list" ? "is-active" : ""}`}
            >
              <span className="view-toggle-icon view-toggle-list" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange?.("grid")}
              aria-pressed={viewMode === "grid"}
              aria-label="Grid view"
              className={`view-toggle-btn ${viewMode === "grid" ? "is-active" : ""}`}
            >
              <span className="view-toggle-icon view-toggle-grid" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={onToggleInfo}
            aria-pressed={isInfoOpen}
            aria-label="Details"
            className={`info-btn no-clear-selection ${isInfoOpen ? "is-active" : ""}`}
          >
            i
          </button>
        </div>
      </div>

      <Section
        title="Suggested folders"
        items={folders}
        status={status}
        emptyText="No recent folders yet"
        renderList={renderList}
      />

      <Section
        title="Suggested files"
        items={files}
        status={status}
        emptyText="No recent files yet"
        renderList={renderList}
      />
    </div>
  );
}
