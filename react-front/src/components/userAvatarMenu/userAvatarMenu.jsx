// src/components/userAvatarMenu/userAvatarMenu.jsx
import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../../api/apiClient";
import { AuthContext } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";
import UserAvatar from "./UserAvatar";
import "./userAvatarMenu.css";

function UserAvatarMenu() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchCurrentUser();
        setUser(data);
      } catch (err) {
        logout();
        navigate(ROUTES.LOGIN);
      }
    }
    loadUser();
  }, [logout, navigate]);

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

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <UserAvatar user={user} className="user-avatar-preview" />
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
    </div>
  );
}

export default UserAvatarMenu;