import { useContext, useEffect, useState } from "react";
import { View, Text } from "react-native";

import { ThemeContext } from "../../Theme/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { useFiles } from "../../hooks/useFiles";
import { useCreateActions } from "../../hooks/useCreateActions";
import { useCreateItem } from "../../hooks/useCreateItem";

import FilesHeader from "../../components/files/FilesHeader";
import FilesEmptyState from "../../components/files/FilesEmptyState";
import FileList from "../../components/files/FileList";
import CreateFab from "../../components/files/CreateFab";
import CreateMenu from "../../components/create/CreateMenu";
import CreateItemModal from "../../components/create/CreateItemModal";

export default function FilesScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const { logout } = useContext(AuthContext);
  const { files, status, loadFiles } = useFiles();
  const { createFile, createFolder, uploadFile } = useCreateActions();

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
        <FileList files={files} />
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
    </View>
  );
}
