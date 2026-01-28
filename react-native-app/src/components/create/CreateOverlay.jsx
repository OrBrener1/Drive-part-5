// Reusable UI component: Create Overlay.

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { uploadFile } from "../../api/filesApi";
import { useCreateItem } from "../../hooks/useCreateItem";
import { useCreateUI } from "../../context/CreateUIContext";
import CreateItemModal from "./CreateItemModal";
import CreateMenu from "./CreateMenu";

export default function CreateOverlay({
  parentId = null,
  onRefresh,
  onCreated,
}) {
  const { menuOpen, closeMenu } = useCreateUI();

  const create = useCreateItem({
    onSuccess: async (created) => {
      await onRefresh?.();
      onCreated?.(created);
      closeMenu();
    },
  });

  async function pickAndUploadFile() {
    try {
      closeMenu();
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "text/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      let uri = file.uri;

      if (uri?.startsWith("content://") && FileSystem?.cacheDirectory) {
        const safeName = String(file.name || "upload").replace(/[\\/:*?"<>|]/g, "_");
        const localUri = `${FileSystem.cacheDirectory}${Date.now()}_${safeName}`;
        await FileSystem.copyAsync({ from: uri, to: localUri });
        uri = localUri;
      }

      const uploadPayload = {
        uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      };

      await uploadFile(uploadPayload, parentId);
      await onRefresh?.();
    } catch {
    }
  }

  return (
    <>
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
          closeMenu();
          create.startCreate("file", parentId);
        }}
        onCreateFolder={() => {
          closeMenu();
          create.startCreate("folder", parentId);
        }}
        onUploadFile={pickAndUploadFile}
      />
    </>
  );
}
