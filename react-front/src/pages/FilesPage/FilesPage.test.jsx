// src/pages/FilesPage/FilesPage.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import FilesPage from "./FilesPage";
import {
  getFiles,
  getStarredFiles,
  getSharedFiles,
  getRecentFiles,
  toggleStar,
} from "../../api/apiClient";
import { AuthContext } from "../../context/AuthContext";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  const mockNavigate = jest.fn();
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => mockNavigate,
  };
});

// Mock FilesContent so these tests stay stable and focus on FilesPage data flow.
// The real empty/loading UI is implemented in FilesContent; unit tests here should
// validate that FilesPage wires props correctly.
jest.mock("../../components/files/FilesContent", () => ({
  __esModule: true,
  default: ({ filesStatus, filesError, files }) => {
    if (filesStatus === "loading" || filesStatus === "idle") {
      return <div>Loading</div>;
    }
    if (filesError) {
      return <div>Failed to load files</div>;
    }
    if (!files || files.length === 0) {
      return <div>No files to display</div>;
    }
    return (
      <ul>
        {files.map((f) => (
          <li key={f.id}>{f.name}</li>
        ))}
      </ul>
    );
  },
}));

jest.mock("../../api/apiClient", () => ({
  getFiles: jest.fn(),
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

test("shows loading message on initial render", () => {
  // Keep all three initial loads pending to avoid act() warnings
  const never = new Promise(() => {});
  getFiles.mockReturnValue(never);
  getStarredFiles.mockReturnValue(never);
  getSharedFiles.mockReturnValue(never);

  renderPage();

  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test("shows empty state when no files are returned", async () => {
  getFiles.mockResolvedValueOnce([]);

  renderPage();

  await waitFor(() => expect(getFiles).toHaveBeenCalled());

  expect(await screen.findByText(/no files to display/i)).toBeInTheDocument();
});

test("shows error message when api call fails", async () => {
  getFiles.mockRejectedValueOnce(new Error("Network error"));

  renderPage();

  await waitFor(() => expect(getFiles).toHaveBeenCalled());

  expect(await screen.findByText(/failed to load files/i)).toBeInTheDocument();
});

test("renders files when api returns data", async () => {
  getFiles.mockResolvedValueOnce([
    { id: "1", name: "file1.txt", type: "file" },
    { id: "2", name: "file2.txt", type: "file" },
  ]);

  renderPage();

  await waitFor(() => expect(getFiles).toHaveBeenCalled());

  expect(await screen.findByText("file1.txt")).toBeInTheDocument();
  expect(screen.getByText("file2.txt")).toBeInTheDocument();
});

test("shows recent files when clicking Recent tab", async () => {
  getFiles.mockResolvedValueOnce([]);
  getRecentFiles.mockResolvedValueOnce([
    {
      id: "r1",
      name: "recent.txt",
      type: "file",
      lastOpened: "2024-01-01T00:00:00.000Z",
    },
  ]);

  renderPage();

  await waitFor(() => expect(getFiles).toHaveBeenCalled());

  await userEvent.click(screen.getByRole("button", { name: /recent/i }));

  await waitFor(() => expect(getRecentFiles).toHaveBeenCalled());
  expect(await screen.findByText("recent.txt")).toBeInTheDocument();
});
