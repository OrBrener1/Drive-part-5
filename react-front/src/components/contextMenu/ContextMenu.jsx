import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./ContextMenu.css";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function ContextMenu({ isOpen, x, y, items, onClose }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  // Close on outside click + ESC
  useEffect(() => {
    if (!isOpen) return;

    function onMouseDown(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        onClose();
      }
    }

    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  // Position menu inside viewport (clamp)
  useLayoutEffect(() => {
    if (!isOpen) return;

    const safeX = typeof x === "number" ? x : 0;
    const safeY = typeof y === "number" ? y : 0;

    // Small offsets so it doesn't cover the cursor
    const OFFSET_X = 6;
    const OFFSET_Y = 6;

    const el = menuRef.current;
    const menuW = el?.offsetWidth ?? 220;
    const menuH = el?.offsetHeight ?? 120;

    const padding = 8; // keep a little margin from screen edges

    const maxLeft = window.innerWidth - menuW - padding;
    const maxTop = window.innerHeight - menuH - padding;

    const left = clamp(safeX + OFFSET_X, padding, maxLeft);
    const top = clamp(safeY + OFFSET_Y, padding, maxTop);

    setPos({ left, top });
  }, [isOpen, x, y, items?.length]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="ctxMenu"
      style={{ left: pos.left, top: pos.top }}
      role="menu"
    >
      {items.map((it) => (
        <button
          key={it.key}
          className="ctxItem"
          role="menuitem"
          onClick={() => {
            it.onClick();
            onClose();
          }}
        >
          {it.iconClass && (
            <span className={`ctxIcon ${it.iconClass}`} aria-hidden="true" />
          )}
          <span className="ctxLabel">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

export default ContextMenu;
