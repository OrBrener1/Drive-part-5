import { useCallback, useContext, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
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
import FileRow from "../../components/files/FileRow";
import FilesEmptyState from "../../components/files/FilesEmptyState";
import PermissionsModal from "../../components/permissions/PermissionsModal";
import { getErrorMessage } from "../../utils/errorMessages";
import LoadingState from "../../components/common/LoadingState";
import { useCreateUI } from "../../context/CreateUIContext";
import CreateFab from "../../components/files/CreateFab";
import CreateOverlay from "../../components/create/CreateOverlay";
import Screen from "../../components/layout/Screen";
import { useViewMode } from "../../context/ViewModeContext";

export default function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { user } = useContext(AuthContext);
  const { files, status, error, loadFiles } = useRecentFiles();
  const { openMenu, closeMenu, menuOpen } = useCreateUI();
  const router = useRouter();
  const pathname = usePathname();
  const permissionsUI = usePermissionsUI();
  const [query, setQuery] = useState("");
  const { viewMode, toggleViewMode } = useViewMode();

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
        router.push({
          pathname: "/private/(tabs)/folder/[id]",
          params: { id: item.id, origin: pathname, parent: "" },
        });
      } else {
        router.push(`/private/file/${item.id}`);
      }
    },
    [pathname, router]
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
        <FileList
          files={items}
          scrollEnabled={false}
          viewMode={viewMode}
          contentContainerStyle={{ paddingBottom: 0 }}
          onItemPress={handleItemPress}
          onOpenPermissions={permissionsUI.openPermissions}
          onToggleStar={handleToggleStar}
          onMoveToBin={handleMoveToBin}
          onRestoreFromBin={handleRestoreFromBin}
          onMove={(item) => router.push(`/private/move/${item.id}`)}
          onRenameSuccess={handleRenameSuccess}
          currentUserId={user?.id}
          listContext="home"
        />
      )}
    </View>
  );

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <TopBar
        query={query}
        onChangeQuery={setQuery}
        onPressSearch={() => router.push("/private/search")}
        showViewToggle
        viewMode={viewMode}
        onToggleView={toggleViewMode}
      />

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
          viewMode={viewMode}
          onItemPress={handleItemPress}
          onMove={(item) => router.push(`/private/move/${item.id}`)}
          onRenameSuccess={handleRenameSuccess}
          onOpenPermissions={permissionsUI.openPermissions}
          onToggleStar={handleToggleStar}
          onMoveToBin={handleMoveToBin}
          onRestoreFromBin={handleRestoreFromBin}
          currentUserId={user?.id}
          listContext="home"
        />
      )}

      {!showSearch && status === "success" && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
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
        onAccessRevoked={loadFiles}
      />
      <CreateOverlay onRefresh={loadFiles} onCreated={() => setQuery("")} />
      <CreateFab
        onPress={() => (menuOpen ? closeMenu() : openMenu())}
        active={menuOpen}
      />
    </Screen>
  );
}
