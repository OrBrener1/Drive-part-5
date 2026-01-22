import { useCallback, useContext, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
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
import CreateOverlay from "../../components/create/CreateOverlay";

export default function FilesScreen({ parentId = null }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const { logout, user } = useContext(AuthContext);
  const { files, status, error, loadFiles } = useFiles(parentId);
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
  const listData = query.trim() ? search.results : files;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
      }}
    >
      <TopBar query={query} onChangeQuery={setQuery} />
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
          onItemPress={(item) => {
            if (item.type === "folder") {
              router.push(`/private/(tabs)/folder/${item.id}`);
            } else {
              router.push(`/private/file/${item.id}`);
            }
          }}
          onOpenPermissions={permissionsUI.openPermissions}
          onToggleStar={handleToggleStar}
          onMoveToBin={handleMoveToBin}
          onRestoreFromBin={handleRestoreFromBin}
          currentUserId={user?.id}
          onRenameSuccess={() => loadFiles()}
          onUnauthorized={logout}
        />
      )}
      <PermissionsModal
        visible={permissionsUI.isPermOpen}
        item={permissionsUI.permItem}
        onClose={permissionsUI.closePermissions}
      />
      <CreateOverlay
        parentId={parentId}
        onRefresh={loadFiles}
        onUnauthorized={logout}
        onCreated={() => setQuery("")}
      />
      <CreateFab onPress={openMenu} />
    </View>
  );
}
