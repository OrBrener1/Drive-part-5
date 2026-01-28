// Screen component for Bin view.

import { useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ThemeContext } from "../../theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import { useBinFiles } from "../../hooks/useBinFiles";
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

export default function BinScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { files, status, error, loadFiles } = useBinFiles();
  const permissionsUI = usePermissionsUI();
  const [query, setQuery] = useState("");
  const { viewMode, toggleViewMode } = useViewMode();

  const { handleMoveToBin, handleRestoreFromBin, handleDeleteForever } =
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
        showNavMenu={false}
        onBack={() => router.back()}
        onPressSearch={() => router.push("/private/search")}
        showViewToggle
        viewMode={viewMode}
        onToggleView={toggleViewMode}
      />
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>
        Bin
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
          {getErrorMessage(error, { fallback: "Failed to load bin items." })}
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
          viewMode={viewMode}
          onOpenPermissions={permissionsUI.openPermissions}
          onMoveToBin={handleMoveToBin}
          onRestoreFromBin={handleRestoreFromBin}
          onDeleteForever={handleDeleteForever}
          listContext="bin"
          currentUserId={user?.id}
        />
      )}

      <PermissionsModal
        visible={permissionsUI.isPermOpen}
        item={permissionsUI.permItem}
        onClose={permissionsUI.closePermissions}
        onAccessRevoked={loadFiles}
      />
    </Screen>
  );
}
