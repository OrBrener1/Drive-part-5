import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import SearchBar from "../search/SearchBar";
import ThemeToggle from "./ThemeToggle";
import "./TopBar.css";

export default function TopBar({ onSearch, isSearching, rightSlot }) {
  const navigate = useNavigate();

  function handleLogoClick() {
    // Uses existing router logic: authenticated -> /files, guest -> /login
    navigate(ROUTES.HOME);
  }

  return (
    <header className="topBar">
      <div className="topBarLeft">
        <button
          type="button"
          className="driveLogoBtn"
          onClick={handleLogoClick}
          aria-label="Go to Drive home"
          title="Drive"
        >
          <img
            src="/ogs-logo.png"
            alt="OGS Drive"
            className="driveLogoImg"
            loading="lazy"
          />
        </button>
      </div>

      <div className="topBarCenter">
        <SearchBar onSearch={onSearch} isLoading={isSearching} />
      </div>

      <div className="topBarRight">
        <ThemeToggle />
        {rightSlot}
      </div>
    </header>
  );
}
