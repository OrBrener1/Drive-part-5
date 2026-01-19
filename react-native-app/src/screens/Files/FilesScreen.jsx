import { useContext, useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";

import { uploadFile } from "../../api/filesApi";
import { ThemeContext } from "../../Theme/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { useFiles } from "../../hooks/useFiles";
import { usePermissionsUI } from "../../hooks/usePermissionsUI";
import { useFileActions } from "../../hooks/useFileActions";
import { useSearchFiles } from "../../hooks/useSearchFiles";
import { useCreateItem } from "../../hooks/useCreateItem";


import CreateMenu from "../../components/create/CreateMenu";
import CreateFab from "../../components/files/CreateFab";
import CreateItemModal from "../../components/create/CreateItemModal";
import FilesEmptyState from "../../components/files/FilesEmptyState";
import FileList from "../../components/files/FileList";
import PermissionsModal from "../../components/permissions/PermissionsModal";
import TopBar from "../../components/nav/TopBar";

export default function FilesScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const { logout, user } = useContext(AuthContext);
  const { files, status, loadFiles } = useFiles();
  const permissionsUI = usePermissionsUI();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);


  useEffect(() => {
    loadFiles().catch((e) => {
      if (e?.message === "UNAUTHORIZED") logout();
    });
  }, [loadFiles, logout]);

  const create = useCreateItem({
  onSuccess: loadFiles,
  onUnauthorized: logout,
});

const search = useSearchFiles(query);
const listData = query.trim() ? search.results : files;

  async function pickAndUploadFile() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "text/*"],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const file = result.assets[0];

    const uploadPayload = {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream",
    };

    await uploadFile(uploadPayload);
    await loadFiles();
  } catch (e) {
    console.error("UPLOAD FAILED", e);
  }
}
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

      {status === "success" && files.length > 0 && (
        <FileList files={listData} />
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
      onUploadFile={() => {
      setMenuOpen(false);
      pickAndUploadFile();
      }}
    />
    </View>
  );
}
