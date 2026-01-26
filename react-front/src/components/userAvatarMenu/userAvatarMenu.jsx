// src/components/userAvatarMenu/userAvatarMenu.jsx
import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";
import UserAvatar from "./UserAvatar";
import "./userAvatarMenu.css";

function UserAvatarMenu() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const { user: authUser, logout, updateUserAvatar } = useContext(AuthContext);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      return;
    }
    setUser(null);
  }, [authUser]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN);
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;
      setProfileError("");
      setUpdatingAvatar(true);
      const res = await updateUserAvatar(result);
      if (!res.ok) {
        setProfileError(res.message || "Avatar update failed");
      }
      setUpdatingAvatar(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleRemoveImage() {
    if (!user?.image) return;
    setProfileError("");
    setUpdatingAvatar(true);
    const res = await updateUserAvatar(null);
    if (!res.ok) {
      setProfileError(res.message || "Avatar update failed");
    }
    setUpdatingAvatar(false);
  }

  function handleUploadClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function getFirstName(displayName) {
    return displayName ? displayName.split(" ")[0] : "";
  }

  if (!user) return null;

  return (
    <div ref={menuRef} className="user-avatar-container">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="user-avatar-button"
        aria-label="Open user menu"
      >
        <UserAvatar user={user} />
      </button>

      {open && (
        <div className="user-menu">
          <p className="user-menu-email">{user.email}</p>

          <div className="user-avatar-preview-wrap">
            <button
              type="button"
              className="user-avatar-preview-button"
              onClick={() => setProfileOpen(true)}
              aria-label="Change profile picture"
            >
              <UserAvatar user={user} className="user-avatar-preview" />
              <span className="user-avatar-camera" aria-hidden="true" />
            </button>
          </div>

          <p className="user-menu-greeting">
            Hi, <strong>{getFirstName(user.displayName)}</strong>
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="btn user-logout-button"
          >
            <span className="logout-icon" aria-hidden="true">
              {"\u{1F6AA}"}
            </span>
            <span>Logout</span>
          </button>
        </div>
      )}

      {profileOpen && (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true">
          <div className="profile-modal">
            <div className="profile-modal-header">
              <button
                type="button"
                className="profile-close"
                onClick={() => setProfileOpen(false)}
                aria-label="Close profile picture"
              >
                ×
              </button>
              <div className="profile-title">Change profile picture</div>
            </div>

            <div className="profile-avatar-preview">
              <UserAvatar user={user} className="user-avatar-preview-large" />
            </div>

            <div className="profile-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <button
                type="button"
                className="profile-action-button"
                onClick={handleUploadClick}
                disabled={updatingAvatar}
              >
                <span className="profile-upload-icon" aria-hidden="true" />
                <span>Upload from device</span>
              </button>

              <button
                type="button"
                className="profile-remove-button"
                onClick={handleRemoveImage}
                disabled={!user?.image || updatingAvatar}
              >
                <span className="profile-remove-icon" aria-hidden="true">
                  ×
                </span>
                <span>Remove image</span>
              </button>
            </div>

            {profileError && (
              <div className="profile-error">{profileError}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserAvatarMenu;
