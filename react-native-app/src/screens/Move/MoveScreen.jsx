import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, I18nManager, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../theme/themeContext";
import Screen from "../../components/layout/Screen";
import { getFileById, getStarredFiles, getDescendants } from "../../api/filesApi";
import { getMoveFolders } from "../../api/moveApi";
import { moveItemApi } from "../../api/moveApi";
import { getErrorMessage } from "../../utils/errorMessages";
import { useCreateItem } from "../../hooks/useCreateItem";
import CreateItemModal from "../../components/create/CreateItemModal";

export default function MoveScreen() {
  const { id } = useLocalSearchParams();
  const itemId = String(id || "");
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const { colors, spacing, typography, radius } = theme;

  const [item, setItem] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [activeTab, setActiveTab] = useState("locations");
  const [folders, setFolders] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | empty | error
  const [error, setError] = useState(null);
  const [starredFolders, setStarredFolders] = useState([]);
  const [starredStatus, setStarredStatus] = useState("idle");
  const [starredError, setStarredError] = useState(null);
  const [descendantIds, setDescendantIds] = useState(new Set());

  const create = useCreateItem({
    onSuccess: async () => {
      const currentId = breadcrumbs[breadcrumbs.length - 1]?.id ?? null;
      await loadFolders(currentId);
    },
  });

  const currentTargetId = breadcrumbs[breadcrumbs.length - 1]?.id ?? null;
  const isInvalidTarget =
    currentTargetId === itemId || descendantIds.has(currentTargetId);
  const canMove = !isInvalidTarget;

  const displayedFolders =
    activeTab === "starred" ? starredFolders : folders;

  const loadFolders = useCallback(async (parentId = null) => {
    setStatus("loading");
    setError(null);
    try {
      const data = await getMoveFolders(parentId);
      setFolders(Array.isArray(data) ? data : []);
      setStatus(data.length === 0 ? "empty" : "success");
    } catch (err) {
      setStatus("error");
      setError(err);
    }
  }, []);

  function getParentName(fullPath) {
    if (!fullPath) return "My Drive";
    const parts = String(fullPath).split("/").filter(Boolean);
    if (parts.length < 2) return "My Drive";
    return parts[parts.length - 2];
  }

  useEffect(() => {
    if (!itemId) return;

    getFileById(itemId)
      .then((data) => {
        setItem(data);
        const parentId = data?.parentId ?? null;
        if (parentId) {
          setBreadcrumbs([
            { id: null, name: "My Drive" },
            { id: parentId, name: getParentName(data?.fullPath) },
          ]);
        loadFolders(parentId);
      } else {
        setBreadcrumbs([{ id: null, name: "My Drive" }]);
        loadFolders(null);
      }
    })
      .catch((err) => {
        setError(err);
        setStatus("error");
      });
  }, [itemId, loadFolders]);

  useEffect(() => {
    if (!itemId) return;
    getDescendants(itemId)
      .then((data) => {
        const ids = Array.isArray(data?.ids) ? data.ids : [];
        setDescendantIds(new Set(ids));
      })
      .catch(() => {
        setDescendantIds(new Set());
      });
  }, [itemId]);

  useEffect(() => {
    if (!itemId) return;
    setStarredStatus("loading");
    setStarredError(null);
    getStarredFiles()
      .then((files) => {
        const onlyFolders = (files || []).filter((f) => f.type === "folder");
        setStarredFolders(onlyFolders);
        setStarredStatus(onlyFolders.length === 0 ? "empty" : "success");
      })
      .catch((err) => {
        setStarredFolders([]);
        setStarredStatus("error");
        setStarredError(err);
      });
  }, [itemId]);

  const enterFolder = (folder) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    loadFolders(folder.id);
  };

  const goBack = () => {
    const newCrumbs = breadcrumbs.slice(0, -1);
    const last = newCrumbs[newCrumbs.length - 1] ?? null;
    setBreadcrumbs(newCrumbs);
    loadFolders(last?.id ?? null);
  };

  const handleMove = async () => {
    try {
      const targetParentId = currentTargetId ?? null;
      await moveItemApi(itemId, targetParentId);
      router.back();
    } catch (err) {
      Alert.alert(
        "Move failed",
        err?.body?.error || getErrorMessage(err, { fallback: "Please try again." })
      );
      setError(err);
    }
  };

  const currentLocation = breadcrumbs.map((b) => b.name).join(" / ");

  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={{ backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: spacing.md,
            gap: spacing.sm,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.round,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <MaterialIcons
              name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.title,
                fontWeight: "600",
              }}
              numberOfLines={1}
            >
              {breadcrumbs[breadcrumbs.length - 1]?.name || "My Drive"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Pressable
              onPress={() => {
                const currentId = breadcrumbs[breadcrumbs.length - 1]?.id ?? null;
                create.startCreate("folder", currentId);
              }}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.round,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <MaterialIcons
                name="create-new-folder"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
            <Pressable
              onPress={() => router.push("/private/search")}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.round,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <MaterialIcons name="search" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Current location */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: typography.small }}>
            Current location:
          </Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 6,
              paddingHorizontal: spacing.sm,
              borderRadius: radius.round,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: typography.small }}>
              {currentLocation || "My Drive"}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.surface,
            borderRadius: radius.round,
            borderWidth: 1,
            borderColor: colors.border,
            alignSelf: "flex-start",
            marginBottom: spacing.md,
          }}
        >
          <Pressable
            onPress={() => setActiveTab("locations")}
            style={{
              paddingVertical: 8,
              paddingHorizontal: spacing.md,
              borderRadius: radius.round,
              backgroundColor:
                activeTab === "locations" ? colors.primary : "transparent",
            }}
          >
            <Text
              style={{
                color:
                  activeTab === "locations" ? colors.onPrimary : colors.textPrimary,
                fontSize: typography.small,
              }}
            >
              My locations
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("starred")}
            style={{
              paddingVertical: 8,
              paddingHorizontal: spacing.md,
              borderRadius: radius.round,
              backgroundColor:
                activeTab === "starred" ? colors.primary : "transparent",
            }}
          >
            <Text
              style={{
                color:
                  activeTab === "starred" ? colors.onPrimary : colors.textPrimary,
                fontSize: typography.small,
              }}
            >
              Starred
            </Text>
          </Pressable>
        </View>

        {/* Back (only in My locations) */}
        {activeTab === "locations" && breadcrumbs.length > 1 && (
          <Pressable
            onPress={goBack}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.sm }}
          >
            <MaterialIcons
              name="arrow-back"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={{ color: colors.textSecondary, marginLeft: 6 }}>
              Back
            </Text>
          </Pressable>
        )}

        <View style={{ flex: 1 }}>
          {/* Status */}
        {activeTab === "locations" && status === "loading" && (
          <Text style={{ color: colors.textSecondary }}>Loading folders...</Text>
        )}
        {activeTab === "locations" && status === "empty" && (
          <Text style={{ color: colors.textSecondary }}>No folders here</Text>
        )}
        {activeTab === "locations" && status === "error" && (
          <Text style={{ color: colors.textSecondary }}>
            {getErrorMessage(error, { fallback: "Failed to load folders." })}
          </Text>
        )}

        {activeTab === "starred" && starredStatus === "loading" && (
          <Text style={{ color: colors.textSecondary }}>Loading starred folders...</Text>
        )}
        {activeTab === "starred" && starredStatus === "empty" && (
          <Text style={{ color: colors.textSecondary }}>No starred folders</Text>
        )}
        {activeTab === "starred" && starredStatus === "error" && (
          <Text style={{ color: colors.textSecondary }}>
            {getErrorMessage(starredError, { fallback: "Failed to load starred folders." })}
          </Text>
        )}

        {/* Folder list */}
        {activeTab === "locations" && status === "success" && (
          <View style={{ flex: 1 }}>
            {displayedFolders.map((folder) => {
              const isDisabled =
                folder.id === itemId || descendantIds.has(folder.id);

              return (
                <Pressable
                  key={folder.id}
                  onPress={() => {
                    if (!isDisabled) enterFolder(folder);
                  }}
                  style={{
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.sm,
                    borderRadius: radius.md,
                    backgroundColor: "transparent",
                    opacity: isDisabled ? 0.4 : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <MaterialIcons name="folder" size={20} color={colors.textSecondary} />
                    <Text style={{ color: colors.textPrimary }}>{folder.name}</Text>
                  </View>
                  {activeTab === "locations" && (
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color={colors.textSecondary}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {activeTab === "starred" && starredStatus === "success" && (
          <View style={{ flex: 1 }}>
            {displayedFolders.map((folder) => {
              const isDisabled =
                folder.id === itemId || descendantIds.has(folder.id);

              return (
                <Pressable
                  key={folder.id}
                  onPress={() => {
                    if (!isDisabled) {
                      setActiveTab("locations");
                      setBreadcrumbs([
                        { id: null, name: "My Drive" },
                        { id: folder.id, name: folder.name },
                      ]);
                      loadFolders(folder.id);
                    }
                  }}
                  style={{
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.sm,
                    borderRadius: radius.md,
                    backgroundColor: "transparent",
                    opacity: isDisabled ? 0.4 : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <MaterialIcons name="folder" size={20} color={colors.textSecondary} />
                    <Text style={{ color: colors.textPrimary }}>{folder.name}</Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              );
            })}
          </View>
        )}
        </View>

        {/* Footer */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: spacing.md,
            paddingTop: spacing.md,
            marginTop: "auto",
          }}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.textSecondary }}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleMove}
            disabled={!canMove}
            style={{
              backgroundColor: canMove ? colors.primary : colors.primaryDisabled,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              borderRadius: radius.md,
            }}
          >
            <Text style={{ color: colors.onPrimary, fontWeight: "600" }}>
              Move here
            </Text>
          </Pressable>
        </View>
      </View>
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
    </Screen>
  );
}
