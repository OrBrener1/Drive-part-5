import { useCallback, useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../../Theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import Screen from "../../components/layout/Screen";
import TopBar from "../../components/nav/TopBar";
import FileList from "../../components/files/FileList";
import FilesEmptyState from "../../components/files/FilesEmptyState";
import LoadingState from "../../components/common/LoadingState";
import PermissionsModal from "../../components/permissions/PermissionsModal";
import { getErrorMessage } from "../../utils/errorMessages";
import { searchFiles } from "../../api/filesApi";
import { useFileActions } from "../../hooks/useFileActions";
import { usePermissionsUI } from "../../hooks/usePermissionsUI";

export default function SearchScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | empty | error
  const [error, setError] = useState(null);
  const permissionsUI = usePermissionsUI();

  const { handleToggleStar, handleMoveToBin, handleRestoreFromBin } =
    useFileActions({ loadFiles: () => runSearch(query) });

  const runSearch = useCallback(async (q) => {
    const trimmed = String(q || "").trim();
    if (!trimmed) {
      setResults([]);
      setStatus("idle");
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const data = await searchFiles(trimmed);
      setResults(Array.isArray(data) ? data : []);
      setStatus((data || []).length === 0 ? "empty" : "success");
    } catch (err) {
      setStatus("error");
      setError(err);
    }
  }, []);

  useEffect(() => {
    const q = String(query || "").trim();
    if (!q) {
      setResults([]);
      setStatus("idle");
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      runSearch(q);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query, runSearch]);

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <TopBar
        query={query}
        onChangeQuery={setQuery}
        showNavMenu={false}
        onBack={() => router.back()}
      />

      {status === "loading" && <LoadingState label="Searching..." />}

      {status === "error" && (
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
          {getErrorMessage(error, { fallback: "Search failed. Try again." })}
        </Text>
      )}

      {status === "empty" && <FilesEmptyState />}

      {status === "success" && results.length > 0 && (
        <FileList
          files={results}
          onItemPress={(item) => {
            if (item.type === "folder") {
              router.push(`/private/(tabs)/folder/${item.id}`);
            } else {
              router.push(`/private/file/${item.id}`);
            }
          }}
          onMove={(item) => router.push(`/private/move/${item.id}`)}
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
        onClose={() => {
          permissionsUI.closePermissions();
          if (query.trim()) {
            runSearch(query);
          }
        }}
      />
    </Screen>
  );
}
