import "./SideBar.css";

export default function SideBar({ topSlot, activeKey, onSelect }) {
  return (
    <aside className="sideBar">
      <div className="sideBarTop">{topSlot}</div>

      <nav className="sideBarNav" aria-label="Side navigation">
        <button
          type="button"
          className={`sideBarItem ${activeKey === "home" ? "active" : ""}`}
          onClick={() => onSelect("home")}
        >
          <span className="sideBarIcon" aria-hidden="true">
            🏠
          </span>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`sideBarItem ${activeKey === "my-drive" ? "active" : ""}`}
          onClick={() => onSelect("my-drive")}
        >
          <span className="sideBarIcon" aria-hidden="true">
            📁
          </span>
          <span>My Drive</span>
        </button>

        <button
          type="button"
          className={`sideBarItem ${activeKey === "shared" ? "active" : ""}`}
          onClick={() => onSelect("shared")}
        >
          <span className="sideBarIcon" aria-hidden="true">
            🤝
          </span>
          <span>Shared with me</span>
        </button>

        <button
          type="button"
          className={`sideBarItem ${activeKey === "recent" ? "active" : ""}`}
          onClick={() => onSelect("recent")}
        >
          <span className="sideBarIcon" aria-hidden="true">
            🕑
          </span>
          <span>Recent</span>
        </button>

        <button
          type="button"
          className={`sideBarItem ${activeKey === "starred" ? "active" : ""}`}
          onClick={() => onSelect("starred")}
        >
          <span className="sideBarIcon" aria-hidden="true">
            ⭐
          </span>
          <span>Starred</span>
        </button>

        <button
          type="button"
          className={`sideBarItem ${activeKey === "trash" ? "active" : ""}`}
          onClick={() => onSelect("trash")}
        >
          <span className="sideBarIcon" aria-hidden="true">
            🗑️
          </span>
          <span>Bin</span>
        </button>
      </nav>
    </aside>
  );
}
