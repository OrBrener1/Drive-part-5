import { useState } from "react";
import { useCreateActions } from "../../hooks/useCreateActions";
import { useCreateItem } from "../../hooks/useCreateItem";
import CreateFab from "../files/CreateFab";
import CreateMenu from "./CreateMenu";
import CreateItemModal from "./CreateItemModal";

export default function CreateOverlay({ onCreated, onUnauthorized }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { uploadFile } = useCreateActions();

  const create = useCreateItem({
    onSuccess: onCreated,
    onUnauthorized,
  });

  return (
    <>
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
    </>
  );
}
