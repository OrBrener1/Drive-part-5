import { useCallback, useContext, useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";

import { ThemeContext } from "../../Theme/ThemeContext";
import { uploadFile } from "../../api/filesApi";
import { AuthContext } from "../../context/AuthContext";
import { useFiles } from "../../hooks/useFiles";
import { usePermissionsUI } from "../../hooks/usePermissionsUI";
import { useCreateUI } from "../../context/CreateUIContext";

import { useFileActions } from "../../hooks/useFileActions";
import { useSearchFiles } from "../../hooks/useSearchFiles";
import { useCreateItem } from "../../hooks/useCreateItem";
import { getErrorMessage } from "../../utils/errorMessages";

import CreateMenu from "../../components/create/CreateMenu";
import CreateFab from "../../components/files/CreateFab";
import CreateItemModal from "../../components/create/CreateItemModal";
import FilesEmptyState from "../../components/files/FilesEmptyState";
import FileList from "../../components/files/FileList";
import PermissionsModal from "../../components/permissions/PermissionsModal";
import TopBar from "../../components/nav/TopBar";
import LoadingState from "../../components/common/LoadingState";
import Screen from "../../components/layout/Screen";

export default function FilesScreen({ parentId = null }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const { logout, user } = useContext(AuthContext);
  const { files, status, error, loadFiles } = useFiles(parentId);
  const permissionsUI = usePermissionsUI();
  const [query, setQuery] = useState("");
  const { menuOpen, openMenu, closeMenu } = useCreateUI();
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

  const create = useCreateItem({
    onSuccess: async () => {
      await loadFiles();
    },
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

      await uploadFile(uploadPayload, parentId);
      await loadFiles();
    } catch (e) {
      console.error("UPLOAD FAILED", e);
    }
  }
  return (
    <Screen
      style={{ backgroundColor: colors.background }}
      contentStyle={{ paddingBottom: 96 }}
    >
      <TopBar query={query} onChangeQuery={setQuery} />
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>
      {parentId ? "Folder" : "My Drive"}
      </Text>
      {status === "loading" && (
        <LoadingState label="Loading files..." />
      )}

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
        <Text style={{ color: colors.textSecondary }}>
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
              router.push(`/private/folder/${item.id}`);
            } else {
              router.push(`/private/file/${item.id}`);
            }
          }}
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
      onClose={closeMenu}
      onCreateFile={() => {
        create.startCreate("file", parentId);
      }}
      onCreateFolder={() => {
        create.startCreate("folder", parentId);
      }}
      onUploadFile={() => {
        pickAndUploadFile();
      }}
    />
    <CreateFab onPress={openMenu} />
    </Screen>
  );
}
