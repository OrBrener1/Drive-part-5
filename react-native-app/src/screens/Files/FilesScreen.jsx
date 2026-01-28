// Screen component for Files view.

import { useCallback, useContext, useState } from "react";
import { Text } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { ThemeContext } from "../../theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import { useFiles } from "../../hooks/useFiles";
import { usePermissionsUI } from "../../hooks/usePermissionsUI";
import { useCreateUI } from "../../context/CreateUIContext";
import { useFileActions } from "../../hooks/useFileActions";
import { useSearchFiles } from "../../hooks/useSearchFiles";
import { getErrorMessage } from "../../utils/errorMessages";

import CreateFab from "../../components/files/CreateFab";
import FilesEmptyState from "../../components/files/FilesEmptyState";
import FileList from "../../components/files/FileList";
import PermissionsModal from "../../components/permissions/PermissionsModal";
import TopBar from "../../components/nav/TopBar";
import LoadingState from "../../components/common/LoadingState";
import Screen from "../../components/layout/Screen";
import CreateOverlay from "../../components/create/CreateOverlay";
import { useViewMode } from "../../context/ViewModeContext";

export default function FilesScreen({ parentId = null, onBack, origin }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const { user } = useContext(AuthContext);
  const { files, status, error, loadFiles, addFile } = useFiles(parentId);
  const permissionsUI = usePermissionsUI();
  const [query, setQuery] = useState("");
  const { viewMode, toggleViewMode } = useViewMode();
  const { openMenu, closeMenu, menuOpen } = useCreateUI();
  const router = useRouter();
  const pathname = usePathname();
  const originPath = origin || pathname;

  const { handleToggleStar, handleMoveToBin, handleRestoreFromBin } =
    useFileActions({ loadFiles });

  useFocusEffect(
    useCallback(() => {
      loadFiles().catch(() => {});
    }, [loadFiles])
  );

  const search = useSearchFiles(query);
  const listData = query.trim() ? search.results : files;

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <TopBar
        query={query}
        onChangeQuery={setQuery}
        onPressSearch={() => router.push("/private/search")}
        showViewToggle
        viewMode={viewMode}
        onToggleView={toggleViewMode}
        onBack={onBack ?? (parentId ? () => router.back() : undefined)}
      />
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>
        {parentId ? "Folder" : "My Drive"}
      </Text>
      {status === "loading" && <LoadingState label="Loading files..." />}

      {query.trim() && search.status === "loading" && (
        <LoadingState label="Searching..." />
      )}

      {query.trim() && search.status === "error" && (
        <Text style={{ color: colors.textSecondary }}>
          {getErrorMessage(search.error, { fallback: "Search failed. Try again." })}
        </Text>
      )}

      {status === "error" && (
        <Text style={{ color: colors.textSecondary }}>
          {getErrorMessage(error, { fallback: "Failed to load files." })}
        </Text>
      )}

      {query.trim() && search.status === "success" && listData.length === 0 && (
        <Text style={{ color: colors.textSecondary }}>No matching results.</Text>
      )}

      {!query.trim() && status === "success" && listData.length === 0 && (
        <FilesEmptyState />
      )}

      {status === "success" && listData.length > 0 && (
        <FileList
          files={listData}
          contentContainerStyle={{ paddingBottom: 96 }}
          viewMode={viewMode}
          onItemPress={(item) => {
            if (item.type === "folder") {
              router.push({
                pathname: "/private/(tabs)/folder/[id]",
                params: {
                  id: item.id,
                  origin: originPath,
                  parent: parentId ?? "",
                },
              });
            } else {
              router.push(`/private/file/${item.id}`);
            }
          }}
          onMove={(item) => router.push(`/private/move/${item.id}`)}
          onOpenPermissions={permissionsUI.openPermissions}
          onToggleStar={handleToggleStar}
          onMoveToBin={handleMoveToBin}
          onRestoreFromBin={handleRestoreFromBin}
          currentUserId={user?.id}
          listContext="my-drive"
          onRenameSuccess={() => loadFiles()}
        />
      )}
      <PermissionsModal
        visible={permissionsUI.isPermOpen}
        item={permissionsUI.permItem}
        onClose={permissionsUI.closePermissions}
        onAccessRevoked={loadFiles}
        onPermissionsUpdated={loadFiles}
      />
      <CreateOverlay
        parentId={parentId}
        onRefresh={loadFiles}
      />
      <CreateFab
        onPress={() => (menuOpen ? closeMenu() : openMenu())}
        active={menuOpen}
      />
    </Screen>
  );
}
