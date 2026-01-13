import { useState } from "react";
import "./SearchBar.css";

export default function SearchBar({ onSearch, isLoading }) {
  // Local state that stores the current text in the input field
  const [query, setQuery] = useState("");

  // Called when the user submits the form (presses Enter or clicks Search)
  function handleSubmit(event) {
    event.preventDefault(); // Prevents full page reload
    onSearch(query);        // Sends the search text to the parent component
  }

  return (
    <form className="searchBar" onSubmit={handleSubmit}>
      <input
        className="searchInput"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)} // Updates state on every keystroke
        placeholder="Search files and folders"
      />

      <button
        className="btn searchBtn"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
