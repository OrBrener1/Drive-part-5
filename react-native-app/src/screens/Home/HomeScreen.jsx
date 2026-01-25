import { useCallback, useContext, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../../Theme/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { useRecentFiles } from "../../hooks/useRecentFiles";
import { usePermissionsUI } from "../../hooks/usePermissionsUI";
import { useFileActions } from "../../hooks/useFileActions";
import { useSearchFiles } from "../../hooks/useSearchFiles";
import TopBar from "../../components/nav/TopBar";
import FileList from "../../components/files/FileList";
import FileRow from "../../components/files/FileRow";
import FilesEmptyState from "../../components/files/FilesEmptyState";
import PermissionsModal from "../../components/permissions/PermissionsModal";
import { getErrorMessage } from "../../utils/errorMessages";
import LoadingState from "../../components/common/LoadingState";
import { useCreateUI } from "../../context/CreateUIContext";
import CreateFab from "../../components/files/CreateFab";
import CreateOverlay from "../../components/create/CreateOverlay";
import Screen from "../../components/layout/Screen";

export default function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { logout, user } = useContext(AuthContext);
  const { files, status, error, loadFiles } = useRecentFiles();
  const { openMenu } = useCreateUI();
  const router = useRouter();
  const permissionsUI = usePermissionsUI();
  const [query, setQuery] = useState("");

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

  const homeFolders = useMemo(
    () => files.filter((f) => f.type === "folder").slice(0, 5),
    [files]
  );
  const homeFiles = useMemo(
    () => files.filter((f) => f.type === "file").slice(0, 10),
    [files]
  );
  const showSearch = Boolean(query.trim());

  const handleItemPress = useCallback(
    (item) => {
      if (item.type === "folder") {
        router.push(`/private/(tabs)/folder/${item.id}`);
      } else {
        router.push(`/private/file/${item.id}`);
      }
    },
    [router]
  );

  const handleRenameSuccess = useCallback(() => {
    loadFiles();
  }, [loadFiles]);

  const renderSection = (title, items, emptyText) => (
    <View style={{ marginTop: 16 }}>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      {items.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>{emptyText}</Text>
      ) : (
        items.map((item) => (
          <FileRow
            key={item.id}
            item={item}
            onPress={() => handleItemPress(item)}
            onOpenPermissions={permissionsUI.openPermissions}
            onToggleStar={handleToggleStar}
            onMoveToBin={handleMoveToBin}
            onRestoreFromBin={handleRestoreFromBin}
            onRenameSuccess={handleRenameSuccess}
            onUnauthorized={logout}
            currentUserId={user?.id}
          />
        ))
      )}
    </View>
  );

  return (
    <Screen
      style={{ backgroundColor: colors.background }}
      contentStyle={{ paddingBottom: 96 }}
    >
      <TopBar query={query} onChangeQuery={setQuery} />

      {showSearch && search.status === "loading" && (
        <LoadingState label="Searching..." />
      )}

      {showSearch && search.status === "error" && (
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
          {getErrorMessage(search.error, { fallback: "Search failed. Try again." })}
        </Text>
      )}

      {!showSearch && status === "loading" && (
        <LoadingState label="Loading recent activity..." />
      )}

      {!showSearch && status === "error" && (
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
          {getErrorMessage(error, { fallback: "Failed to load recent files." })}
        </Text>
      )}

      {showSearch && search.status === "success" && listData.length === 0 && (
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
          No matching results.
        </Text>
      )}

      {showSearch && search.status === "success" && listData.length > 0 && (
        <FileList
          files={listData}
          contentContainerStyle={{ paddingBottom: 96 }}
          onItemPress={handleItemPress}
          onRenameSuccess={handleRenameSuccess}
          onUnauthorized={logout}
          onOpenPermissions={permissionsUI.openPermissions}
          onToggleStar={handleToggleStar}
          onMoveToBin={handleMoveToBin}
          onRestoreFromBin={handleRestoreFromBin}
          currentUserId={user?.id}
        />
      )}

      {!showSearch && status === "success" && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginTop: 4 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 20,
                fontWeight: "700",
              }}
            >
              Welcome!
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              Suggestions based on your recent activity
            </Text>
          </View>

          {renderSection("Suggested folders", homeFolders, "No recent folders yet")}
          {renderSection("Suggested files", homeFiles, "No recent files yet")}
        </ScrollView>
      )}

      <PermissionsModal
        visible={permissionsUI.isPermOpen}
        item={permissionsUI.permItem}
        onClose={permissionsUI.closePermissions}
      />
      <CreateOverlay onRefresh={loadFiles} onUnauthorized={logout} />
      <CreateFab onPress={openMenu} />
    </Screen>
  );
}
