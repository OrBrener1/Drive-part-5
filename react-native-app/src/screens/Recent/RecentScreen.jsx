import { useCallback, useContext, useMemo, useState } from "react";
import { Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { usePathname, useRouter } from "expo-router";
import { ThemeContext } from "../../theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import { useRecentFiles } from "../../hooks/useRecentFiles";
import { usePermissionsUI } from "../../hooks/usePermissionsUI";
import { useFileActions } from "../../hooks/useFileActions";
import { useSearchFiles } from "../../hooks/useSearchFiles";
import TopBar from "../../components/nav/TopBar";
import FileList from "../../components/files/FileList";
import FilesEmptyState from "../../components/files/FilesEmptyState";
import PermissionsModal from "../../components/permissions/PermissionsModal";
import { getErrorMessage } from "../../utils/errorMessages";
import LoadingState from "../../components/common/LoadingState";
import Screen from "../../components/layout/Screen";
import { useViewMode } from "../../context/ViewModeContext";

export default function RecentScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { logout, user } = useContext(AuthContext);
  const { files, status, error, loadFiles } = useRecentFiles();
  const permissionsUI = usePermissionsUI();
  const [query, setQuery] = useState("");
  const { viewMode, toggleViewMode } = useViewMode();
  const router = useRouter();
  const pathname = usePathname();

  const { handleToggleStar, handleMoveToBin, handleRestoreFromBin } =
    useFileActions({
      loadFiles,
      onUnauthorized: () => logout(),
    });

  useFocusEffect(
    useCallback(() => {
      loadFiles().catch((e) => {
        if (e?.message === "UNAUTHORIZED") logout();
      });
    }, [loadFiles, logout])
  );

  const search = useSearchFiles(query);
  const listData = useMemo(() => {
    if (query.trim()) {
      return search.results;
    }
    return files;
  }, [files, query, search.results]);

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <TopBar
        query={query}
        onChangeQuery={setQuery}
        showNavMenu={false}
        onBack={() => router.back()}
        onPressSearch={() => router.push("/private/search")}
        showViewToggle
        viewMode={viewMode}
        onToggleView={toggleViewMode}
      />
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>
        Recent
      </Text>

      {status === "loading" && (
        <LoadingState label="Loading files..." />
      )}

      {query.trim() && search.status === "loading" && (
        <LoadingState label="Searching..." />
      )}

      {query.trim() && search.status === "error" && (
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
          {getErrorMessage(search.error, { fallback: "Search failed. Try again." })}
        </Text>
      )}

      {status === "error" && (
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
          {getErrorMessage(error, { fallback: "Failed to load recent files." })}
        </Text>
      )}

      {query.trim() && search.status === "success" && listData.length === 0 && (
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
          No matching results.
        </Text>
      )}

      {!query.trim() && status === "success" && listData.length === 0 && (
        <FilesEmptyState
          title="No recent files"
          subtitle="Open a file or folder to see it here"
        />
      )}

      {status === "success" && listData.length > 0 && (
        <FileList
          files={listData}
          viewMode={viewMode}
          onItemPress={(item) => {
            if (item.type === "folder") {
              router.push({
                pathname: "/private/(tabs)/folder/[id]",
                params: { id: item.id, origin: pathname, parent: "" },
              });
            } else {
              router.push(`/private/file/${item.id}`);
            }
          }}
          onRenameSuccess={() => loadFiles()}
          onUnauthorized={logout}
          onOpenPermissions={permissionsUI.openPermissions}
          onToggleStar={handleToggleStar}
          onMoveToBin={handleMoveToBin}
          onRestoreFromBin={handleRestoreFromBin}
          currentUserId={user?.id}
          listContext="recent"
        />
      )}

      <PermissionsModal
        visible={permissionsUI.isPermOpen}
        item={permissionsUI.permItem}
        onClose={permissionsUI.closePermissions}
      />
    </Screen>
  );
}
