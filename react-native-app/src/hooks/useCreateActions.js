import { createFile, createFolder } from "../api/filesApi";
import { useFiles } from "./useFiles";

export function useCreateActions() {
  const { loadFiles } = useFiles();

  const handleCreateFile = async ({ name, parentId = null }) => {
    await createFile({ name, parentId });
    await loadFiles();
  };

  const handleCreateFolder = async ({ name, parentId = null }) => {
    await createFolder({ name, parentId });
    await loadFiles();
  };

  return {
    createFile: handleCreateFile,
    createFolder: handleCreateFolder,
  };
}
