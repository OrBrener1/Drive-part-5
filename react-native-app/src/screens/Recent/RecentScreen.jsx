import Screen from "../../components/layout/Screen";
import { useRecentFiles } from "../../hooks/useRecentFiles";
import FileList from "../../components/files/FileList";
import FilesEmptyState from "../../components/files/FilesEmptyState";

export default function RecentScreen() {
  const { files, loading, error, reload } = useRecentFiles();

  if (!loading && files.length === 0) {
    return <FilesEmptyState title="No recent files" />;
  }

  return (
    <Screen>
      <FileList
        files={files}
        loading={loading}
        error={error}
        onRefresh={reload}
        onRenameSuccess={reload}
      />
    </Screen>
  );
}
