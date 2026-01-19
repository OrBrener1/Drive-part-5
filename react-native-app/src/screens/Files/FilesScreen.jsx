import { useCallback, useContext, useMemo, useState } from "react";
import { View, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { ThemeContext } from "../../theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import { useFiles } from "../../hooks/useFiles";
import { usePermissionsUI } from "../../hooks/usePermissionsUI";
import { useFileActions } from "../../hooks/useFileActions";
import { useSearchFiles } from "../../hooks/useSearchFiles";

import FilesEmptyState from "../../components/files/FilesEmptyState";
import FileList from "../../components/files/FileList";
import PermissionsModal from "../../components/permissions/PermissionsModal";
import TopBar from "../../components/nav/TopBar";
import CreateOverlay from "../../components/create/CreateOverlay";

export default function FilesScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const { logout, user } = useContext(AuthContext);
  const { files, status, loadFiles } = useFiles();
  const permissionsUI = usePermissionsUI();
  const [query, setQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadFiles().catch((e) => {
        if (e?.message === "UNAUTHORIZED") logout();
      });
    }, [loadFiles, logout])
  );

  const { handleToggleStar, handleMoveToBin, handleRestoreFromBin } =
    useFileActions({
      loadFiles,
      onUnauthorized: () => logout(),
    });

  const search = useSearchFiles(query);
  const listData = useMemo(() => {
    if (query.trim()) {
      return search.results;
    }
    return files;
  }, [files, query, search.results]);

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
        My Drive
      </Text>
      {status === "loading" && (
        <Text style={{ color: colors.textSecondary }}>
          Loading files...
        </Text>
      )}

      {query.trim() && search.status === "loading" && (
        <Text style={{ color: colors.textSecondary }}>
          Searching...
        </Text>
      )}

      {query.trim() && search.status === "error" && (
        <Text style={{ color: colors.textSecondary }}>
          Search failed. Try again.
        </Text>
      )}

      {status === "success" && listData.length === 0 && (
        <FilesEmptyState />
      )}

      {status === "success" && listData.length > 0 && (
        <FileList
          files={listData}
          onOpenPermissions={permissionsUI.openPermissions}
          onToggleStar={handleToggleStar}
          onMoveToBin={handleMoveToBin}
          onRestoreFromBin={handleRestoreFromBin}
          currentUserId={user?.id}
        />
      )}

      <CreateOverlay
        onCreated={loadFiles}
        onUnauthorized={(err) => {
          if (err?.message === "UNAUTHORIZED") logout();
        }}
      />
      <PermissionsModal
        visible={permissionsUI.isPermOpen}
        item={permissionsUI.permItem}
        onClose={permissionsUI.closePermissions}
      />
    </View>
  );
}
