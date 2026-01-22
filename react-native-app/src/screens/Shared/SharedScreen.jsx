import { useCallback, useContext, useMemo, useState } from "react";
import { View, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { useSharedFiles } from "../../hooks/useSharedFiles";
import { usePermissionsUI } from "../../hooks/usePermissionsUI";
import { useFileActions } from "../../hooks/useFileActions";
import { useSearchFiles } from "../../hooks/useSearchFiles";
import TopBar from "../../components/nav/TopBar";
import FileList from "../../components/files/FileList";
import FilesEmptyState from "../../components/files/FilesEmptyState";
import PermissionsModal from "../../components/permissions/PermissionsModal";
import { getErrorMessage } from "../../utils/errorMessages";
import LoadingState from "../../components/common/LoadingState";
import { ThemeContext } from "../../theme/themeContext";
import CreateFab from "../../components/files/CreateFab";
import { useCreateUI } from "../../context/CreateUIContext";
import CreateOverlay from "../../components/create/CreateOverlay";

export default function SharedScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { logout, user } = useContext(AuthContext);
  const { files, status, error, loadFiles } = useSharedFiles();
  const permissionsUI = usePermissionsUI();
  const [query, setQuery] = useState("");
  const { openMenu } = useCreateUI();
  const router = useRouter();

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
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <TopBar query={query} onChangeQuery={setQuery} />
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>
        Shared with me
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
          {getErrorMessage(error, { fallback: "Failed to load shared files." })}
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
          onRenameSuccess={() => loadFiles()}
          onUnauthorized={logout}
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
      <CreateOverlay onRefresh={loadFiles} onUnauthorized={logout} />
      <CreateFab onPress={openMenu} />
    </View>
  );
}
