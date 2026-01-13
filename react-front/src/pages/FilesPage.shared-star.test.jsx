// src/pages/FilesPage.shared-star.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import FilesPage from "./FilesPage/FilesPage";
import { AuthContext } from "../context/AuthContext";

// Deterministic fixtures
// NOTE: Jest forbids jest.mock factories from referencing out-of-scope variables
// unless their names start with "mock".
let mockSharedItems;
let mockStarredItems;

// Mock router hooks used by FilesPage
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  const mockNavigate = jest.fn();
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => mockNavigate,
  };
});

// Mock FilesContent to render only what we need for assertions
jest.mock("../components/files/FilesContent", () => ({
  __esModule: true,
  default: ({ files = [], showOwner, onToggleStar }) => (
    <ul>
      {files.map((f) => (
        <li key={f.id}>
          <span>{f.name}</span>
          {showOwner && f.ownerName ? (
            <span data-testid={`owner-${f.id}`}>{f.ownerName}</span>
          ) : null}
          <button type="button" onClick={() => onToggleStar?.(f.id)}>
            star
          </button>
        </li>
      ))}
    </ul>
  ),
}));

// Mock irrelevant UI to keep test minimal/stable
jest.mock("../components/userAvatarMenu/userAvatarMenu", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("../components/permissions/PermissionsModal", () => ({
  __esModule: true,
  default: () => null,
}));

// Mock hooks used by FilesPage to avoid async / act issues
// NOTE: paths are relative to THIS test file (src/pages/*)
jest.mock("../hooks/useFiles", () => ({
  useFiles: () => ({
    files: [],
    status: "success",
    error: null,
    loadFiles: jest.fn(async () => {}),
  }),
}));

jest.mock("../hooks/useSearchFiles", () => ({
  useSearchFiles: () => ({
    searchActive: false,
    searchStatus: "idle",
    searchError: null,
    searchResults: [],
    search: jest.fn(),
    clearSearch: jest.fn(),
  }),
}));

jest.mock("../hooks/useOpenItem", () => ({
  useOpenItem: () => ({
    item: null,
    openItem: jest.fn(),
    closeItem: jest.fn(),
  }),
}));

jest.mock("../hooks/useFileSelection", () => ({
  useFileSelection: () => ({
    select: jest.fn(),
    isSelected: jest.fn(() => false),
  }),
}));

jest.mock("../hooks/useCreateItem", () => ({
  useCreateItem: () => ({
    createType: null,
    startCreate: jest.fn(),
    cancelCreate: jest.fn(),
    submit: jest.fn(),
    name: "",
    content: "",
    nameError: null,
    contentError: null,
    createError: null,
    canSubmit: false,
    onNameChange: jest.fn(),
    onNameCompositionStart: jest.fn(),
    onNameCompositionEnd: jest.fn(),
    onContentChange: jest.fn(),
  }),
}));

jest.mock("../hooks/useCreateUI", () => ({
  useCreateUI: () => ({
    isMenuOpen: false,
    openMenu: jest.fn(),
    closeMenu: jest.fn(),
  }),
}));

jest.mock("../hooks/usePermissionsUI", () => ({
  usePermissionsUI: () => ({
    isPermOpen: false,
    permItem: null,
    openPermissions: jest.fn(),
    closePermissions: jest.fn(),
  }),
}));

jest.mock("../hooks/useSharedFiles", () => ({
  __esModule: true,
  default: () => ({
    files: mockSharedItems,
    status: "success",
    error: null,
    reload: jest.fn(),
  }),
}));

jest.mock("../hooks/useStarredFiles", () => ({
  __esModule: true,
  default: () => ({
    files: mockStarredItems,
    status: "success",
    error: null,
    reload: jest.fn(),
  }),
}));

jest.mock("../hooks/useToggleStar", () => ({
  __esModule: true,
  default: () => ({
    toggle: async (id) => {
      const fromShared = mockSharedItems.find((x) => x.id === id);
      if (!fromShared) return;

      const already = mockStarredItems.find((x) => x.id === id);
      if (already) {
        mockStarredItems = mockStarredItems.filter((x) => x.id !== id);
      } else {
        mockStarredItems = [...mockStarredItems, { ...fromShared, isStarred: true }];
      }
    },
  }),
}));

// Test helpers
const renderWithProviders = () =>
  render(
    <AuthContext.Provider
      value={{
        token: "t",
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      }}
    >
      <MemoryRouter initialEntries={["/files"]}>
        <FilesPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

beforeEach(() => {
  mockSharedItems = [{ id: "f_2_1", name: "shared.doc", type: "file", ownerName: "Alice" }];
  mockStarredItems = [];
});

test("Shared with me shows owner and items from others", async () => {
  renderWithProviders();

  await userEvent.click(screen.getByRole("button", { name: /shared with me/i }));

  expect(await screen.findByText("shared.doc")).toBeInTheDocument();
  expect(screen.getByTestId("owner-f_2_1")).toHaveTextContent("Alice");
});

test("Starring a shared item appears only in my Starred view", async () => {
  const view = renderWithProviders();

  // Go to shared
  await userEvent.click(screen.getByRole("button", { name: /shared with me/i }));
  expect(await screen.findByText("shared.doc")).toBeInTheDocument();

  // Star it (updates mockStarredItems fixture)
  await userEvent.click(screen.getByRole("button", { name: /^star$/i }));

  // Re-render to re-read mocked hook outputs
  view.rerender(
    <AuthContext.Provider
      value={{
        token: "t",
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      }}
    >
      <MemoryRouter initialEntries={["/files"]}>
        <FilesPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  // Go to Starred view
  await userEvent.click(screen.getByRole("button", { name: /starred/i }));

  // Now it should appear in starred list
  expect(await screen.findByText("shared.doc")).toBeInTheDocument();
});