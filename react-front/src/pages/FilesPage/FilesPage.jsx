import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPermissions } from "../../api/apiClient";

// Components
import CreateItemPanel from "../../components/create/CreateItemPanel";
import FilesContent from "../../components/files/FilesContent";
import HomeSuggestions from "../../components/files/HomeSuggestions";
import FilesList from "../../components/FilesList";
import TopBar from "../../components/topbar/TopBar";
import SideBar from "../../components/sidebar/SideBar";
import CreateMenu from "../../components/create/CreateMenu";
import PermissionsModal from "../../components/permissions/PermissionsModal";
import UserAvatarMenu from "../../components/userAvatarMenu/userAvatarMenu";
import CreateItemModal from "../../components/create/CreateItemModal";
import MoveDialog from "../../components/MoveDialog/MoveDialog";
import BackButton from "../../components/navigation/BackButton";

// Hooks
import { useFiles } from "../../hooks/useFiles";
import { useSearchFiles } from "../../hooks/useSearchFiles";
import { useCreateItem } from "../../hooks/useCreateItem";
import { useCreateUI } from "../../hooks/useCreateUI";
import { usePermissionsUI } from "../../hooks/usePermissionsUI";
import useStarredFiles from "../../hooks/useStarredFiles";
import useToggleStar from "../../hooks/useToggleStar";
import { useFileSelection } from "../../hooks/useFileSelection";
import { useOpenItem } from "../../hooks/useOpenItem";
import useSharedFiles from "../../hooks/useSharedFiles";
import useRecentFiles from "../../hooks/useRecentFiles";
import { useBinFiles } from "../../hooks/useBinFiles";
import { useBinActions } from "../../hooks/useBinActions";

// Context & constants
import { AuthContext } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";

// Styles
import "./FilesPage.css";

function FilesPage() {
  // AUTH
  // ======================================================
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuthErrors = useCallback(
    (err) => {
      if (err?.message === "UNAUTHORIZED" || err?.status === 401) {
        logout();
        navigate(ROUTES.LOGIN, { replace: true });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  // ROUTING
  const { id } = useParams(); // opened folder id (if any)

  // DATA
  const { files, status, error, loadFiles } = useFiles();

  const {
    files: starredFiles,
    status: starredStatus,
    error: starredError,
    reload: reloadStarredFiles,
    setFiles: setStarredFiles,
  } = useStarredFiles({ onUnauthorized: handleAuthErrors });

  const {
    files: sharedFiles,
    status: sharedStatus,
    error: sharedError,
    reload: reloadSharedFiles,
  } = useSharedFiles({
    onUnauthorized: handleAuthErrors,
  });

  const {
    files: recentFiles,
    status: recentStatus,
    error: recentError,
    reload: reloadRecentFiles,
  } = useRecentFiles({
    onUnauthorized: handleAuthErrors,
  });

  const {
    files: binFiles,
    status: binStatus,
    error: binError,
    loadBinFiles,
  } = useBinFiles({
    onUnauthorized: handleAuthErrors,
  });

  const [renamedNames, setRenamedNames] = useState({});

  // DERIVED DATA (UI-only)
  const starredIds = useMemo(
    () => new Set(starredFiles.map((f) => f.id)),
    [starredFiles]
  );

  const decorateItems = useCallback(
    (items, mode = "default") =>
      items.map((item) => {
        const renamedName = renamedNames[item.id];
        const baseItem =
          renamedName && renamedName !== item.name
            ? { ...item, name: renamedName }
            : item;

        if (mode === "starred") {
          return { ...baseItem, _isStarred: true };
        }
        if (mode === "unstarred") {
          return { ...baseItem, _isStarred: false };
        }
        return { ...baseItem, _isStarred: starredIds.has(item.id) };
      }),
    [renamedNames, starredIds]
  );

  // SEARCH
  const {
    searchActive,
    searchStatus,
    searchError,
    searchResults,
    lastQuery,
    search,
    clearSearch,
  } = useSearchFiles();

  const safeSearch = useCallback(
    async (query) => {
      try {
        await search(query);
      } catch (err) {
        handleAuthErrors(err);
      }
    },
    [search, handleAuthErrors]
  );

  const decoratedSearchResults = useMemo(
    () => decorateItems(searchResults || []),
    [decorateItems, searchResults]
  );

  // STAR ACTION
  const {
    item: openedItem,
    setItem: setOpenedItem,
    openItem,
    closeItem,
  } = useOpenItem({
    onUnauthorized: handleAuthErrors,
  });

  const getItemForStar = useCallback(
    (itemId) => {
      const pools = [
        files,
        starredFiles,
        sharedFiles,
        recentFiles,
        binFiles,
        searchResults || [],
        openedItem ? [openedItem] : [],
        openedItem?.children || [],
      ];

      for (const list of pools) {
        const found = list.find((item) => item?.id === itemId);
        if (found) return found;
      }

      return null;
    },
    [
      files,
      starredFiles,
      sharedFiles,
      recentFiles,
      binFiles,
      searchResults,
      openedItem,
    ]
  );

  const { toggle: toggleStar } = useToggleStar({
    onOptimistic: (itemId) => {
      const snapshot = [...starredFiles];
      const isStarredNow = starredIds.has(itemId);

      if (isStarredNow) {
        setStarredFiles((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        const item = getItemForStar(itemId);
        if (item) {
          setStarredFiles((prev) => {
            if (prev.some((existing) => existing.id === itemId)) return prev;
            return [...prev, { ...item, isStarred: true }];
          });
        }
      }

      return () => setStarredFiles(snapshot);
    },
    onSuccess: () => {},
  });

  // BIN ACTIONS
  const { moveToBin, restoreFromBin, deleteForever } = useBinActions({
    onUnauthorized: handleAuthErrors,
  });

  // SELECTION + OPEN
  const fileSelection = useFileSelection();

  useEffect(() => {
    if (!id) {
      closeItem();
      return;
    }
    openItem(id);
  }, [id, openItem, closeItem]);

  // CREATE
  const {
    createType,
    startCreate,
    cancelCreate,
    submit,
    name,
    content,
    nameError,
    contentError,
    createError,
    canSubmit,
    onNameChange,
    onNameCompositionStart,
    onNameCompositionEnd,
    onContentChange,
    setNameDirectly,
    setContentDirectly,
  } = useCreateItem({
    onSuccess: () => {
      setSelectedItem(null);
      if (id) {
        openItem(id);
      } else {
        loadFiles();
        reloadRecentFiles();
      }
    },
    onUnauthorized: handleAuthErrors,
  });

  const { isMenuOpen, openMenu, closeMenu } = useCreateUI();

  // PERMISSIONS
  const { isPermOpen, permItem, openPermissions, closePermissions } =
    usePermissionsUI();

  // MOVE
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveItem, setMoveItem] = useState(null);

  // SIDEBAR STATE
  const [activeSideKey, setActiveSideKey] = useState("home");
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [detailsStatus, setDetailsStatus] = useState("idle");
  const [detailsError, setDetailsError] = useState(null);
  const [detailsPermissions, setDetailsPermissions] = useState([]);

  // INITIAL LOAD
  useEffect(() => {
    loadFiles().catch(handleAuthErrors);
    reloadRecentFiles();
  }, [loadFiles, reloadRecentFiles, handleAuthErrors]);

  useEffect(() => {
    if (activeSideKey === "trash") {
      loadBinFiles().catch(handleAuthErrors);
    }
  }, [activeSideKey, loadBinFiles, handleAuthErrors]);

  const allItems = useMemo(() => {
    const items = [
      ...files,
      ...starredFiles,
      ...sharedFiles,
      ...recentFiles,
      ...binFiles,
    ];
    if (openedItem) {
      items.push(openedItem);
      if (Array.isArray(openedItem.children)) {
        items.push(...openedItem.children);
      }
    }
    return decorateItems(items).map((item) => {
      const { _isStarred, ...rest } = item;
      return rest;
    });
  }, [
    files,
    starredFiles,
    sharedFiles,
    recentFiles,
    binFiles,
    openedItem,
    decorateItems,
  ]);

  const itemByFullPath = useMemo(() => {
    const map = new Map();
    for (const item of allItems) {
      if (item && item.fullPath) {
        map.set(item.fullPath, item);
      }
    }
    return map;
  }, [allItems]);

  const showBreadcrumbs = useMemo(
    () =>
      Boolean(openedItem) ||
      ["my-drive", "recent", "shared", "starred"].includes(activeSideKey),
    [activeSideKey, openedItem]
  );

  const isOpenedSharedItem = useMemo(() => {
    if (!openedItem?.ownerId || !user?.id) return false;
    return Number(openedItem.ownerId) !== Number(user.id);
  }, [openedItem?.ownerId, user?.id]);

  const breadcrumbRootName = useMemo(() => {
    if (activeSideKey === "shared") return "Shared with me";
    if (activeSideKey === "recent") {
      return openedItem
        ? isOpenedSharedItem
          ? "Shared with me"
          : "My Drive"
        : "Recent";
    }
    if (activeSideKey === "starred") {
      return openedItem
        ? isOpenedSharedItem
          ? "Shared with me"
          : "My Drive"
        : "Starred";
    }
    return "My Drive";
  }, [activeSideKey, openedItem, isOpenedSharedItem]);

  const breadcrumbs = useMemo(() => {
    if (!showBreadcrumbs) {
      return [];
    }

    const rootCrumb = { id: null, name: breadcrumbRootName };
    if (!openedItem?.fullPath) {
      return [rootCrumb];
    }

    const parts = openedItem.fullPath.split("/").filter(Boolean);
    const crumbs = [rootCrumb];
    let currentPath = "";

    for (const part of parts) {
      currentPath += `/${part}`;
      const found = itemByFullPath.get(currentPath);
      crumbs.push({
        id: found?.id ?? null,
        name: found?.name ?? part,
      });
    }

    return crumbs;
  }, [openedItem?.fullPath, itemByFullPath, breadcrumbRootName, showBreadcrumbs]);

  function handleBackClick() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    setActiveSideKey("my-drive");
    closeItem();
    navigate(ROUTES.FILES);
  }

  useEffect(() => {
    function handleGlobalClick(e) {
      const target = e.target;
      if (target && target.closest(".no-clear-selection")) {
        return;
      }
      fileSelection.clear();
    }

    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [fileSelection]);

  // VIEW RESOLUTION
  function resolveDisplayedView() {
    // When a folder/file is opened, show its contents regardless of sidebar tab
    if (openedItem) {
      return {
        files: openedItem.children ?? [],
        status: "success",
        error: null,
      };
    }

    if (searchActive) {
      return {
        files: decoratedSearchResults,
        status: searchStatus,
        error: searchError,
      };
    }

    if (activeSideKey === "home") {
      const effectiveStatus = recentStatus === "idle" ? "loading" : recentStatus;
      return {
        files: recentFiles.slice(0, 10),
        status: effectiveStatus,
        error: recentError,
      };
    }

    if (activeSideKey === "starred") {
      return {
        files: starredFiles,
        status: starredStatus,
        error: starredError,
      };
    }

    if (activeSideKey === "shared") {
      return {
        files: sharedFiles,
        status: sharedStatus === "idle" ? "loading" : sharedStatus,
        error: sharedError,
      };
    }

    if (activeSideKey === "recent") {
      const effectiveStatus = recentStatus === "idle" ? "loading" : recentStatus;
      return {
        files: recentFiles,
        status: effectiveStatus,
        error: recentError,
      };
    }

    if (activeSideKey === "trash") {
      return {
        files: binFiles,
        status: binStatus,
        error: binError,
      };
    }

    return {
      files,
      status,
      error,
    };
  }

  const {
    files: displayedFiles,
    status: displayedStatus,
    error: displayedError,
  } = resolveDisplayedView();

  const decoratedDisplayedFiles = useMemo(() => {
    if (activeSideKey === "trash") {
      return decorateItems(displayedFiles, "unstarred");
    }
    return decorateItems(displayedFiles);
  }, [displayedFiles, activeSideKey, decorateItems]);

  const homeFolders = decorateItems(
    recentFiles.filter((f) => f.type === "folder").slice(0, 5)
  );
  const homeFiles = decorateItems(
    recentFiles.filter((f) => f.type === "file").slice(0, 10)
  );
  const showHomeSuggestions =
    !searchActive && !openedItem && activeSideKey === "home";

  const selectedDetailsItem = useMemo(() => {
    const id = fileSelection.selectedId;
    if (!id) return null;
    const pool = showHomeSuggestions
      ? [...homeFolders, ...homeFiles]
      : decoratedDisplayedFiles;
    return pool.find((item) => item.id === id) || null;
  }, [fileSelection.selectedId, showHomeSuggestions, homeFolders, homeFiles, decoratedDisplayedFiles]);

  useEffect(() => {
    if (!isInfoOpen || !selectedDetailsItem?.id) {
      setDetailsStatus("idle");
      setDetailsError(null);
      setDetailsPermissions([]);
      return;
    }

    let cancelled = false;
    setDetailsStatus("loading");
    setDetailsError(null);

    (async () => {
      try {
        const res = await getPermissions(selectedDetailsItem.id);
        if (cancelled) return;
        setDetailsPermissions(res || []);
        setDetailsStatus("success");
      } catch (err) {
        if (cancelled) return;
        if (handleAuthErrors(err)) return;
        setDetailsStatus("error");
        setDetailsError(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isInfoOpen, selectedDetailsItem?.id, handleAuthErrors]);

  // HANDLERS
  function handleSelect(itemId) {
    fileSelection.select(itemId);
  }

  function handleOpenItem(item) {
    if (!item?.id) return;
    if (activeSideKey === "trash") {
      alert("Restore the item from the bin before opening it.");
      return;
    }
    if (item.type === "folder") {
      navigate(`${ROUTES.FILES}/${item.id}`);
      return;
    }
    navigate(`${ROUTES.FILES}/${item.id}/view`);
  }

  function handleSideBarSelect(key) {
    // Close move dialog if open
    setMoveDialogOpen(false);
    setMoveItem(null);

    if (searchActive) clearSearch();
    setActiveSideKey(key);

    if (key === "home" || key === "my-drive") {
      loadFiles();
      reloadRecentFiles();
      closeItem();
      navigate(ROUTES.FILES);
      return;
    }

    if (key === "starred") {
      closeItem();
      reloadStarredFiles();
      navigate(ROUTES.FILES);
      return;
    }

    if (key === "shared") {
      closeItem();
      reloadSharedFiles();
      navigate(ROUTES.FILES);
      return;
    }

    if (key === "recent") {
      closeItem();
      reloadRecentFiles();
      navigate(ROUTES.FILES);
      return;
    }

    if (key === "trash") {
      closeItem();
      loadBinFiles().catch(handleAuthErrors);
      navigate(ROUTES.FILES);
      return;
    }

    closeItem();
    navigate(ROUTES.FILES);
  }

  function handleBreadcrumbClick(crumb) {
    if (!crumb || !crumb.id) {
      if (activeSideKey === "shared") {
        closeItem();
        navigate(ROUTES.FILES);
        return;
      }

      if (activeSideKey === "recent" || activeSideKey === "starred") {
        if (openedItem) {
          setActiveSideKey(isOpenedSharedItem ? "shared" : "my-drive");
        }
        closeItem();
        navigate(ROUTES.FILES);
        return;
      }

      if (activeSideKey !== "shared") {
        setActiveSideKey("my-drive");
      }
      closeItem();
      navigate(ROUTES.FILES);
      return;
    }
    navigate(`${ROUTES.FILES}/${crumb.id}`);
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  }

  async function handleMoveToBin(itemId) {
    try {
      await moveToBin(itemId);
      await Promise.all([
        loadFiles(),
        reloadStarredFiles(),
        reloadRecentFiles(),
        loadBinFiles(),
        reloadSharedFiles(),
      ]);
      if (searchActive && lastQuery) {
        await safeSearch(lastQuery);
      }
    } catch (err) {
      handleAuthErrors(err);
    }
  }

  async function handleRestoreFromBin(itemId) {
    try {
      await restoreFromBin(itemId);
      await Promise.all([
        loadFiles(),
        reloadStarredFiles(),
        reloadRecentFiles(),
        loadBinFiles(),
      ]);
      setActiveSideKey("home");
      navigate(ROUTES.FILES);
    } catch (err) {
      handleAuthErrors(err);
    }
  }

  async function handleDeleteForever(itemId) {
    try {
      await deleteForever(itemId);
      await Promise.all([
        loadFiles(),
        reloadStarredFiles(),
        reloadRecentFiles(),
        loadBinFiles(),
      ]);
    } catch (err) {
      handleAuthErrors(err);
    }
  }

  const handleMove = useCallback((item) => {
  setMoveItem(item);
  setMoveDialogOpen(true);
  }, []);

  function applyRenameLocally(itemId, newName) {
    setRenamedNames((prev) => ({
      ...prev,
      [itemId]: newName,
    }));

    if (openedItem?.id === itemId) {
      setOpenedItem((prev) => ({
        ...prev,
        name: newName,
      }));
    }

    if (openedItem?.children) {
      setOpenedItem((prev) => ({
        ...prev,
        children: prev.children.map((c) =>
          c.id === itemId ? { ...c, name: newName } : c
        ),
      }));
    }

    if (activeSideKey === "starred") {
      reloadStarredFiles();
    }

    if (activeSideKey === "recent" || activeSideKey === "home") {
      reloadRecentFiles();
    }
  }

  // RENDER
  return (
    <div>
      <TopBar
        onSearch={safeSearch}
        isSearching={searchStatus === "loading"}
        rightSlot={<UserAvatarMenu />}
      />

      <SideBar
        activeKey={activeSideKey}
        onSelect={handleSideBarSelect}
        topSlot={
          <CreateMenu
            isOpen={isMenuOpen}
            onOpen={openMenu}
            onClose={closeMenu}
            onStartCreateFile={() => {
              setSelectedItem(null);
              startCreate("file", id ?? null);
            }}
            onStartCreateFolder={() => {
              setSelectedItem(null);
              startCreate("folder", id ?? null);
            }}
            onUploadFile={(item) => {
              const parentIdForCreate = id ?? openedItem?.id ?? null;
              setSelectedItem(item);
              startCreate("file", parentIdForCreate);
              setNameDirectly(item.name);

              const reader = new FileReader();
              reader.onloadend = () => {
                const result = typeof reader.result === "string" ? reader.result : "";
                setContentDirectly(result);
              };
              if (item.type && item.type.startsWith("image/")) {
                reader.readAsDataURL(item);
              } else {
                reader.readAsText(item);
              }
            }}
          />
        }
      />

      <main className="files-page-main with-sidebar">
        {createType && (
          <CreateItemModal
            isOpen={Boolean(createType)}
            onClose={() => {
              setSelectedItem(null);
              cancelCreate();
            }}
          >
            <CreateItemPanel
              type={createType}
              name={name}
              content={content}
              selectedItem={selectedItem}
              nameError={nameError}
              contentError={contentError}
              createError={createError}
              canSubmit={canSubmit}
              onNameChange={onNameChange}
              onNameCompositionStart={onNameCompositionStart}
              onNameCompositionEnd={onNameCompositionEnd}
              onContentChange={onContentChange}
              onSubmit={submit}
              onCancel={() => {
                setSelectedItem(null);
                cancelCreate();
              }}
            />
          </CreateItemModal>
        )}

        {showBreadcrumbs && breadcrumbs.length > 1 && (
          <BackButton onBack={handleBackClick} />
        )}

        {showBreadcrumbs && breadcrumbs.length > 0 && (
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.id ?? "root"} className="breadcrumb">
              <button
                type="button"
                className="breadcrumb-btn"
                onClick={() => handleBreadcrumbClick(crumb)}
              >
                {crumb.name}
              </button>
              {idx < breadcrumbs.length - 1 && (
                <span className="breadcrumb-sep">›</span>
              )}
            </span>
          ))}
          </div>
        )}

        <div className="files-layout">
          <div className="files-list-panel">
            {showHomeSuggestions ? (
              <HomeSuggestions
                status={recentStatus === "idle" ? "loading" : recentStatus}
                error={recentError}
                folders={homeFolders}
                files={homeFiles}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isInfoOpen={isInfoOpen}
                onToggleInfo={() => setIsInfoOpen((prev) => !prev)}
                onSelect={handleSelect}
                onOpen={handleOpenItem}
                onToggleStar={toggleStar}
                onShare={openPermissions}
                onRenameSuccess={applyRenameLocally}
                isSelected={fileSelection.isSelected}
                currentUserId={user?.id}
                renderListComponent={FilesList}
                onMoveToBin={handleMoveToBin}
                onRestore={handleRestoreFromBin}
                onDeleteForever={handleDeleteForever}
                onMove={handleMove}
              />
            ) : (
              <>
                <div className="files-toolbar">
                  <div className="header-actions">
                    <div className="view-toggle" role="group" aria-label="View mode">
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        aria-pressed={viewMode === "list"}
                        aria-label="List view"
                        className={`view-toggle-btn ${viewMode === "list" ? "is-active" : ""}`}
                      >
                        <span className="view-toggle-icon view-toggle-list" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        aria-pressed={viewMode === "grid"}
                        aria-label="Grid view"
                        className={`view-toggle-btn ${viewMode === "grid" ? "is-active" : ""}`}
                      >
                        <span className="view-toggle-icon view-toggle-grid" aria-hidden="true" />
                      </button>
                  </div>
                    <button
                      type="button"
                      onClick={() => setIsInfoOpen((prev) => !prev)}
                      aria-pressed={isInfoOpen}
                      aria-label="Details"
                      className={`info-btn no-clear-selection ${isInfoOpen ? "is-active" : ""}`}
                    >
                      i
                    </button>
                  </div>
                </div>

                <FilesContent
                  searchActive={searchActive}
                  searchStatus={searchStatus}
                  searchError={searchError}
                  searchResults={decoratedSearchResults}
                  filesStatus={displayedStatus}
                  filesError={displayedError}
                  files={decoratedDisplayedFiles}
                  showOwner={
                    activeSideKey === "shared" ||
                    activeSideKey === "recent" ||
                    activeSideKey === "home" ||
                    activeSideKey === "trash"
                  }
                  showLastOpened={
                    activeSideKey === "recent" || activeSideKey === "home"
                  }
                  viewMode={viewMode}
                  onShare={openPermissions}
                  onToggleStar={toggleStar}
                  isSelected={fileSelection.isSelected}
                  onSelect={handleSelect}
                  onOpen={handleOpenItem}
                  onRenameSuccess={applyRenameLocally}
                  onMoveToBin={handleMoveToBin}
                  onRestore={handleRestoreFromBin}
                  onDeleteForever={handleDeleteForever}
                  isBinView={activeSideKey === "trash"}
                  onMove={handleMove}
                  currentUserId={user?.id}
                />
              </>
            )}
          </div>

          {isInfoOpen && (
            <aside className="details-panel no-clear-selection">
              <div className="details-header">
                <div className="details-title">Details</div>
                <button
                  type="button"
                  className="details-close"
                  onClick={() => setIsInfoOpen(false)}
                  aria-label="Close details"
                >
                  x
                </button>
              </div>

              {!selectedDetailsItem && (
                <div className="details-empty">
                  Select an item to see the details
                </div>
              )}

              {selectedDetailsItem && (
                <>
                  <div className="details-row">
                    <div className="details-label">Name</div>
                    <div className="details-value">{selectedDetailsItem.name}</div>
                  </div>
                  <div className="details-row">
                    <div className="details-label">Type</div>
                    <div className="details-value">
                      {selectedDetailsItem.type === "folder"
                        ? "Folder"
                        : selectedDetailsItem.contentType === "image"
                          ? "Image"
                          : "Text"}
                    </div>
                  </div>
                  <div className="details-row">
                    <div className="details-label">Owner</div>
                    <div className="details-value">
                      {selectedDetailsItem.ownerName || selectedDetailsItem.ownerEmail || "-"}
                    </div>
                  </div>
                  <div className="details-row">
                    <div className="details-label">Created</div>
                    <div className="details-value">
                      {formatDate(
                        selectedDetailsItem.createdAt ||
                        selectedDetailsItem.createdOn ||
                        selectedDetailsItem.created
                      )}
                    </div>
                  </div>

                  <div className="details-section">
                    <div className="details-label">Access</div>
                    {detailsStatus === "loading" && (
                      <div className="details-muted">Loading...</div>
                    )}
                    {detailsStatus === "error" && (
                      <div className="details-muted">
                        Failed to load access{detailsError ? `: ${detailsError.message || detailsError}` : ""}
                      </div>
                    )}
                    {detailsStatus === "success" && (
                      <div className="details-list">
                        {detailsPermissions.length === 0 && (
                          <div className="details-muted">No shared users</div>
                        )}
                        {detailsPermissions.map((perm) => (
                          <div className="details-list-item" key={perm.id}>
                            <div className="details-list-name">
                              {perm.user?.displayName || perm.user?.email || "User"}
                            </div>
                            <div className="details-list-role">
                              {perm.type === "READ"
                                ? "Viewer"
                                : perm.type === "WRITE"
                                  ? "Editor"
                                  : "Admin"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </aside>
          )}
        </div>
      </main>

      <PermissionsModal
        isOpen={isPermOpen}
        item={permItem}
        onClose={closePermissions}
      />
      {moveDialogOpen && moveItem && (
      <MoveDialog
        isOpen={moveDialogOpen}
        item={moveItem}
        onClose={() => {
          setMoveDialogOpen(false);
          setMoveItem(null);
        }}
        onMoved={() => {
          loadFiles();
          reloadRecentFiles();
          reloadStarredFiles();
          reloadSharedFiles();
          if (openedItem?.id) {
              openItem(openedItem.id);
            }
        }}
      />
    )}
    </div>
  );
}

export default FilesPage;
