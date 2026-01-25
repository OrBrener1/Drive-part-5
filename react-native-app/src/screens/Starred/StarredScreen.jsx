import { useCallback, useContext, useMemo, useState } from "react";
import { Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../../Theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import { useStarredFiles } from "../../hooks/useStarredFiles";
import { usePermissionsUI } from "../../hooks/usePermissionsUI";
import { useFileActions } from "../../hooks/useFileActions";
import { useSearchFiles } from "../../hooks/useSearchFiles";
import TopBar from "../../components/nav/TopBar";
import FileList from "../../components/files/FileList";
import FilesEmptyState from "../../components/files/FilesEmptyState";
import PermissionsModal from "../../components/permissions/PermissionsModal";
import { getErrorMessage } from "../../utils/errorMessages";
import LoadingState from "../../components/common/LoadingState";
import { useCreateUI } from "../../context/CreateUIContext";
import CreateFab from "../../components/files/CreateFab";
import Screen from "../../components/layout/Screen";
import CreateOverlay from "../../components/create/CreateOverlay";

export default function StarredScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { user } = useContext(AuthContext);
  const { files, status, error, loadFiles } = useStarredFiles();
  const permissionsUI = usePermissionsUI();
  const [query, setQuery] = useState("");
  const { openMenu } = useCreateUI();
  const router = useRouter();

  const { handleToggleStar, handleMoveToBin, handleRestoreFromBin } =
    useFileActions({ loadFiles });

  useFocusEffect(
    useCallback(() => {
      loadFiles().catch(() => {});
    }, [loadFiles])
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
        onPressSearch={() => router.push("/private/search")}
      />
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>
        Starred
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
          {getErrorMessage(error, { fallback: "Failed to load starred files." })}
        </Text>
      )}

      {query.trim() && search.status === "success" && listData.length === 0 && (
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
          No matching results.
        </Text>
      )}

      {!query.trim() && status === "success" && listData.length === 0 && (
        <FilesEmptyState />
      )}

      {status === "success" && listData.length > 0 && (
        <FileList
          files={listData}
          onItemPress={(item) => {
            if (item.type === "folder") {
              router.push(`/private/(tabs)/folder/${item.id}`);
            } else {
              router.push(`/private/file/${item.id}`);
            }
          }}
          onMove={(item) => router.push(`/private/move/${item.id}`)}
          onRenameSuccess={() => loadFiles()}
          onOpenPermissions={permissionsUI.openPermissions}
          onToggleStar={handleToggleStar}
          onMoveToBin={handleMoveToBin}
          onRestoreFromBin={handleRestoreFromBin}
          currentUserId={user?.id}
        />
      )}

      <PermissionsModal
        visible={permissionsUI.isPermOpen}
        item={permissionsUI.permItem}
        onClose={permissionsUI.closePermissions}
      />
      <CreateOverlay onRefresh={loadFiles} />
      <CreateFab onPress={openMenu} />
    </Screen>
  );
}
