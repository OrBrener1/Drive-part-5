// src/pages/FilesPage.search.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import FilesPage from "./FilesPage/FilesPage";
import {
  getFiles,
  searchFiles,
  getStarredFiles,
  getSharedFiles,
  getRecentFiles,
  toggleStar,
} from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  const mockNavigate = jest.fn();
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => mockNavigate,
  };
});

// Mock FilesList to keep tests focused on FilesPage behavior (not FileItem UI)
jest.mock("../components/FilesList", () => ({
  __esModule: true,
  default: ({ files }) => (
    <ul>
      {files.map((f) => (
        <li key={f.id}>{f.name}</li>
      ))}
    </ul>
  ),
}));

// Mock apiClient so hooks do not perform real network calls during tests
jest.mock("../api/apiClient", () => ({
  getFiles: jest.fn(),
  searchFiles: jest.fn(),
  getStarredFiles: jest.fn(),
  getSharedFiles: jest.fn(),
  getRecentFiles: jest.fn(),
  toggleStar: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  getStarredFiles.mockResolvedValue([]);
  getSharedFiles.mockResolvedValue([]);
  getRecentFiles.mockResolvedValue([]);
  toggleStar.mockResolvedValue({ id: "x", isStarred: true });
});

const renderPage = () =>
  render(
    <AuthContext.Provider
      value={{
        isAuthenticated: true,
        isLoading: false,
        token: "t",
        login: jest.fn(),
        logout: jest.fn(),
      }}
    >
      <MemoryRouter initialEntries={["/files"]}>
        <FilesPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

test("P1-512: SearchBar renders and input is controlled", async () => {
  getFiles.mockResolvedValueOnce([]);

  renderPage();

  await waitFor(() => expect(getFiles).toHaveBeenCalled());

  const input = screen.getByPlaceholderText(/search files and folders/i);
  await userEvent.type(input, "abc");

  expect(input).toHaveValue("abc");
});

test("P1-513 + P1-514: submitting query calls search API and shows results", async () => {
  getFiles.mockResolvedValueOnce([]); // initial load
  searchFiles.mockResolvedValueOnce([{ id: "1", name: "report.pdf", type: "file" }]);

  renderPage();

  await userEvent.type(
    screen.getByPlaceholderText(/search files and folders/i),
    "rep{enter}"
  );

  await waitFor(() => expect(searchFiles).toHaveBeenCalledWith("rep"));
  expect(await screen.findByText("report.pdf")).toBeInTheDocument();
});

test("P1-515: shows empty state when API returns []", async () => {
  getFiles.mockResolvedValueOnce([]);
  searchFiles.mockResolvedValueOnce([]);

  renderPage();

  await userEvent.type(
    screen.getByPlaceholderText(/search files and folders/i),
    "nope{enter}"
  );

  await waitFor(() => expect(searchFiles).toHaveBeenCalledWith("nope"));

  // The UI text can vary; keep this assertion flexible
  expect(await screen.findByText(/no matching results|no items to display/i)).toBeInTheDocument();
});

test("P1-516: shows error state when search API rejects", async () => {
  getFiles.mockResolvedValueOnce([]);
  searchFiles.mockRejectedValueOnce(new Error("Server down"));

  renderPage();

  await userEvent.type(
    screen.getByPlaceholderText(/search files and folders/i),
    "boom{enter}"
  );

  await waitFor(() => expect(searchFiles).toHaveBeenCalledWith("boom"));

  // After the code fix, the rejection is handled in UI state (no unhandled rejection).
  // Assert that either a generic error label or the original message is shown.
  expect(await screen.findByText(/search failed|server down/i)).toBeInTheDocument();
});

test("Side bar navigation exits search mode and restores main list", async () => {
  getFiles.mockResolvedValueOnce([{ id: "a", name: "file1.txt", type: "file" }]);
  searchFiles.mockResolvedValueOnce([{ id: "b", name: "found.txt", type: "file" }]);

  renderPage();

  expect(await screen.findByText("file1.txt")).toBeInTheDocument();

  await userEvent.type(
    screen.getByPlaceholderText(/search files and folders/i),
    "found{enter}"
  );

  expect(await screen.findByText("found.txt")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: /home/i }));

  expect(await screen.findByText("file1.txt")).toBeInTheDocument();
});

test("Empty query: submit with spaces exits search mode and does NOT call search API", async () => {
  getFiles.mockResolvedValueOnce([{ id: "a", name: "file1.txt", type: "file" }]);

  renderPage();

  await userEvent.type(
    screen.getByPlaceholderText(/search files and folders/i),
    "   {enter}"
  );

  expect(searchFiles).not.toHaveBeenCalled();
  expect(await screen.findByText("file1.txt")).toBeInTheDocument();
});
