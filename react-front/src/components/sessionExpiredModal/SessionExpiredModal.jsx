import React from "react";
import "./SessionExpiredModal.css";

export default function SessionExpiredModal({ onConfirm }) {
  return (
    <div className="session-expired-backdrop">
      <div className="session-expired-modal surface">
        <h3>Session ended ⚠️</h3>
        <p>Please log in again.</p>

        <button className="btn btn-primary" onClick={onConfirm}>
          Log in
        </button>
      </div>
    </div>
  );
}
