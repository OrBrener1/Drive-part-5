import { useContext, useEffect, useState } from "react";
import { Alert, View, Text } from "react-native";

import { ThemeContext } from "../../theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import { useFiles } from "../../hooks/useFiles";
import { useCreateActions } from "../../hooks/useCreateActions";
import { useCreateItem } from "../../hooks/useCreateItem";
import { usePermissionsUI } from "../../hooks/usePermissionsUI";
import { moveFileToBin, restoreFileFromBin, toggleStar } from "../../api/filesApi";

import FilesHeader from "../../components/files/FilesHeader";
import FilesEmptyState from "../../components/files/FilesEmptyState";
import FileList from "../../components/files/FileList";
import CreateFab from "../../components/files/CreateFab";
import CreateMenu from "../../components/create/CreateMenu";
import CreateItemModal from "../../components/create/CreateItemModal";
import PermissionsModal from "../../components/permissions/PermissionsModal";

export default function FilesScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const { logout, user } = useContext(AuthContext);
  const { files, status, loadFiles } = useFiles();
  const { createFile, createFolder, uploadFile } = useCreateActions();
  const permissionsUI = usePermissionsUI();

  const [menuOpen, setMenuOpen] = useState(false);

  const create = useCreateItem({
    onSuccess: loadFiles,
    onUnauthorized: (err) => {
      if (err.message === "UNAUTHORIZED") logout();
    },
  });

  useEffect(() => {
    loadFiles().catch((e) => {
      if (e?.message === "UNAUTHORIZED") logout();
    });
  }, [loadFiles, logout]);

  const handleToggleStar = async (item) => {
    try {
      await toggleStar(item.id);
      await loadFiles();
    } catch (e) {
      if (e?.message === "UNAUTHORIZED") logout();
    }
  };

  const handleMoveToBin = async (item) => {
    try {
      await moveFileToBin(item.id);
      await loadFiles();
    } catch (e) {
      if (e?.message === "UNAUTHORIZED") logout();
      Alert.alert("Failed to move to bin", e?.message || "Please try again.");
    }
  };

  const handleRestoreFromBin = async (item) => {
    try {
      await restoreFileFromBin(item.id);
      await loadFiles();
    } catch (e) {
      if (e?.message === "UNAUTHORIZED") logout();
      Alert.alert("Failed to restore", e?.message || "Please try again.");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
      }}
    >
      <FilesHeader />

      {status === "loading" && (
        <Text style={{ color: colors.textSecondary }}>
          Loading files...
        </Text>
      )}

      {status === "success" && files.length === 0 && (
        <FilesEmptyState />
      )}

      {status === "success" && files.length > 0 && (
        <FileList
          files={files}
          onOpenPermissions={permissionsUI.openPermissions}
          onToggleStar={handleToggleStar}
          onMoveToBin={handleMoveToBin}
          onRestoreFromBin={handleRestoreFromBin}
          currentUserId={user?.id}
        />
      )}

      <CreateFab onPress={() => setMenuOpen(true)} />
      <CreateItemModal
        visible={Boolean(create.createType)}
        type={create.createType}
        name={create.name}
        content={create.content}
        nameError={create.nameError}
        createError={create.createError}
        canSubmit={create.canSubmit}
        onNameChange={create.onNameChange}
        onContentChange={create.onContentChange}
        onSubmit={create.submit}
        onCancel={create.cancelCreate}
      />
      <CreateMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onCreateFile={() => {
          setMenuOpen(false);
          create.startCreate("file");
        }}
        onCreateFolder={() => {
          setMenuOpen(false);
          create.startCreate("folder");
        }}
        onUploadFile={uploadFile}
      />
      <PermissionsModal
        visible={permissionsUI.isPermOpen}
        item={permissionsUI.permItem}
        onClose={permissionsUI.closePermissions}
      />
    </View>
  );
}
