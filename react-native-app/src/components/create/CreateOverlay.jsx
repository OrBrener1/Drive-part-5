import * as DocumentPicker from "expo-document-picker";
import { uploadFile } from "../../api/filesApi";
import { useCreateItem } from "../../hooks/useCreateItem";
import { useCreateUI } from "../../context/CreateUIContext";
import CreateItemModal from "./CreateItemModal";
import CreateMenu from "./CreateMenu";

export default function CreateOverlay({
  parentId = null,
  onRefresh,
  onUnauthorized,
  onCreated,
}) {
  const { menuOpen, closeMenu } = useCreateUI();

  const create = useCreateItem({
    onSuccess: async (created) => {
      await onRefresh?.();
      onCreated?.(created);
      closeMenu();
    },
    onUnauthorized,
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

      const uploadPayload = {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      };

      await uploadFile(uploadPayload, parentId);
      await onRefresh?.();
    } catch (e) {
      console.error("UPLOAD FAILED", e);
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
