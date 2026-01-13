import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  getPermissions,
  addPermission,
  updatePermission,
  removePermission,
} from "../../api/apiClient";
import UserAvatar from "../userAvatarMenu/UserAvatar";
import "./PermissionsModal.css";

function PermissionsModal({ isOpen, item, onClose }) {
  const { user: currentUser } = useContext(AuthContext);
  const [permissions, setPermissions] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("READ");
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!isOpen || !item?.id) return;
    let cancelled = false;
    setPermissions([]);
    setStatus("loading");
    setErrorMsg("");
    setNewEmail("");
    setIsSharing(false);

    async function fetchData() {
      try {
        const res = await getPermissions(item.id);
        if (cancelled) return;
        setPermissions(res || []);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(err?.message || "Failed to load permissions");
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [isOpen, item?.id]);

  async function handleShare() {
    if (!newEmail.trim()) return;
    setIsSharing(true);
    setErrorMsg("");
    try {
      const newPerm = await addPermission(item.id, newEmail, newRole);
      setPermissions((prev) => [...prev, newPerm]);
      setStatus("success");
      setNewEmail("");
      setNewRole("READ");
    } catch (err) {
      setErrorMsg(err?.message || "Failed to share file");
    } finally {
      setIsSharing(false);
    }
  }

  async function handleRoleChange(permId, nextRole) {
    setErrorMsg("");
    try {
      setPermissions((prev) =>
        prev.map((p) => (p.id === permId ? { ...p, type: nextRole } : p))
      );
      await updatePermission(item.id, permId, nextRole);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update permission");
      const res = await getPermissions(item.id);
      setPermissions(res);
    }
  }

  async function handleRemove(permId) {
    if (!window.confirm("Remove this user's access?")) return;
    try {
      await removePermission(item.id, permId);
      setPermissions((prev) => prev.filter((p) => p.id !== permId));
    } catch (err) {
      setErrorMsg("Failed to remove permission");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="permOverlay" onClick={onClose}>
      <div className="permModal" onClick={(e) => e.stopPropagation()}>
        <div className="permHeader">
          <div className="permTitle">Share "{item?.name}"</div>
          <button
            className="permCloseBtn"
            onClick={onClose}
            type="button"
            aria-label="Close sharing dialog"
          >
            ×
          </button>
        </div>

        <div className="permAddSection">
          <input
            className="permInput"
            placeholder="Add people by email..."
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleShare()}
          />
          <select
            className="permSelect"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="READ">Viewer</option>
            <option value="WRITE">Editor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            className="btn btn-primary permShareBtn"
            disabled={!newEmail.trim() || isSharing}
            onClick={handleShare}
            type="button"
          >
            {isSharing ? "Sharing..." : "Share"}
          </button>
        </div>

        {errorMsg && (
          <div className="permErrorBar">
            <div className="permError">Error: {errorMsg}</div>
          </div>
        )}

        <div className="permBody">
          <div className="permSubTitle">People with access</div>
          {status === "loading" && <div className="permInfo">Loading...</div>}

          {status === "success" && (
            <div className="permList">
              {permissions.map((p) => {
                const isOwner = item.ownerId === p.userId;
                const isMe = currentUser?.email === p.user?.email;

                return (
                  <div className="permRow" key={p.id}>
                    <div className="permAvatarHolder">
                      <UserAvatar user={p.user} className="user-avatar" />
                    </div>

                    <div className="permUserCol">
                      <div className="permName">
                        {p.user?.displayName || "Unknown"} {isMe ? "(You)" : ""}
                      </div>
                      <div className="permEmail">{p.user?.email}</div>
                    </div>

                    {isOwner ? (
                      <div className="permOwnerLabel">Owner</div>
                    ) : (
                      <select
                        className="permRoleSelect"
                        value={p.type}
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                      >
                        <option value="READ">Viewer</option>
                        <option value="WRITE">Editor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    )}

                    {!isOwner ? (
                      <button
                        className="permDeleteBtn"
                        title="Remove access"
                        onClick={() => handleRemove(p.id)}
                        type="button"
                        aria-label="Remove access"
                      >
                        ×
                      </button>
                    ) : (
                      <div style={{ width: 28 }}></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="permFooter">
          <button className="btn permDoneBtn" onClick={onClose} type="button">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default PermissionsModal;
