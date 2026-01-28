import { useContext, useEffect, useMemo, useState } from "react";
import { Alert, Linking, Modal, Platform, Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../theme/themeContext";
import RenameModal from "./RenameModal";
import Avatar from "../avatar/Avatar";
import BottomSheet from "../bottomSheet/BottomSheet";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getDownloadUrl, getPermissions } from "../../api/filesApi";
import { getToken } from "../../api/apiClient";


const ICONS = {
  info: "\u2139\uFE0F",
  people: "\uD83D\uDC65",
  star: "\u2B50",
  download: "\u2B07",
  rename: "\u270F\uFE0F",
  move: "\u2194",
  restore: "\u267B\uFE0F",
  delete: "\u274C",
  bin: "\uD83D\uDDD1\uFE0F",
  folder: "\uD83D\uDCC1",
  image: "\uD83D\uDDBC\uFE0F",
  file: "\uD83D\uDCC4",
  dash: "\u2014",
};

export default function FileRow({
  item,
  onPress,
  onOpenPermissions,
  onToggleStar,
  onMoveToBin,
  onRestoreFromBin,
  onDeleteForever,
  onMove,
  onRenameSuccess,
  listContext = "default",
  currentUserId,
  viewMode = "list",
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsShared, setDetailsShared] = useState(null);

  const isFolder = item?.type === "folder";
  const isImage = item?.contentType === "image";
  const isStarred = Boolean(item?.isStarred);
  const isShared =
    typeof item?.isShared === "boolean"
      ? item.isShared
      : currentUserId && String(item?.ownerId) !== String(currentUserId);
  const isBinView = listContext === "bin";
  const isGrid = viewMode === "grid";
  const showOwnerAvatar = listContext === "shared";
  const ownerUser = showOwnerAvatar
    ? {
        id: item?.ownerId,
        displayName: item?.ownerName,
        email: item?.ownerEmail,
        image: item?.ownerImage,
      }
    : null;
  const lastOpenedLabel = formatDateTime(item?.lastOpened);
  const createdAtLabel = formatDateTime(item?.createdAt);
  const ownerId = item?.ownerId ? String(item.ownerId) : null;
  const showLastOpened = listContext === "recent" || listContext === "home";
  const timestampLabel = showLastOpened
    ? lastOpenedLabel
      ? `Last opened: ${lastOpenedLabel}`
      : null
    : createdAtLabel
      ? `Created at: ${createdAtLabel}`
      : null;

  async function handleDownload() {
    try {
      if (!FileSystem?.documentDirectory && !FileSystem?.cacheDirectory) {
        const confirmed = await confirmBrowserDownload();
        if (!confirmed) {
          return;
        }
        const opened = await openRawInBrowser(item?.id);
        if (!opened) {
          throw new Error("FILESYSTEM_UNAVAILABLE_REBUILD_CLIENT");
        }
        return;
      }
      const choice = await askDownloadChoice();
      if (choice === "cancel") {
        return;
      }
      if (choice === "browser") {
        const confirmed = await confirmBrowserDownload();
        if (!confirmed) {
          return;
        }
        const opened = await openRawInBrowser(item?.id);
        if (!opened) {
          throw new Error("BROWSER_OPEN_FAILED");
        }
        return;
      }
      const baseName = String(item?.name || `file_${item?.id}`)
        .replace(/[\\/:*?"<>|]/g, "_");
      let target = null;

      if (Platform.OS === "android") {
        const saf = FileSystem.StorageAccessFramework;
        if (saf?.requestDirectoryPermissionsAsync) {
          const permission = await saf.requestDirectoryPermissionsAsync();
          if (!permission.granted) {
            throw new Error("STORAGE_PERMISSION_DENIED");
          }
          const tmp = await downloadToTemp(baseName, item?.id);
          const headerMime = getHeaderMime(tmp?.headers);
          const mimeType =
            detectMimeFromName(baseName) ||
            headerMime ||
            inferMimeFromItem(item) ||
            "application/octet-stream";
          const finalName = ensureNameHasExtension(baseName, mimeType);
          const fileUri = await saf.createFileAsync(
            permission.directoryUri,
            finalName,
            mimeType
          );
          await FileSystem.copyAsync({ from: tmp.uri, to: fileUri });
          await FileSystem.deleteAsync(tmp.uri, { idempotent: true });
          target = fileUri;
        } else {
          const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
          if (!baseDir) {
            throw new Error("STORAGE_UNAVAILABLE");
          }
          const hasExt = /\.[A-Za-z0-9]+$/.test(baseName);
          if (hasExt) {
            target = `${baseDir}${baseName}`;
            await downloadToPath(item?.id, target);
          } else {
            const tmpPath = `${baseDir}${Date.now()}_${baseName}`;
            const res = await downloadToPath(item?.id, tmpPath);
            const headerMime = getHeaderMime(res?.headers);
            const mimeType =
              detectMimeFromName(baseName) ||
              headerMime ||
              inferMimeFromItem(item) ||
              "application/octet-stream";
            const finalName = ensureNameHasExtension(baseName, mimeType);
            target = `${baseDir}${finalName}`;
            await FileSystem.moveAsync({ from: tmpPath, to: target });
          }
        }
      } else {
        const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
        if (!baseDir) {
          throw new Error("STORAGE_UNAVAILABLE");
        }
        const hasExt = /\.[A-Za-z0-9]+$/.test(baseName);
        if (hasExt) {
          target = `${baseDir}${baseName}`;
          await downloadToPath(item?.id, target);
        } else {
          const tmpPath = `${baseDir}${Date.now()}_${baseName}`;
          const res = await downloadToPath(item?.id, tmpPath);
          const headerMime = getHeaderMime(res?.headers);
          const mimeType =
            detectMimeFromName(baseName) ||
            headerMime ||
            inferMimeFromItem(item) ||
            "application/octet-stream";
          const finalName = ensureNameHasExtension(baseName, mimeType);
          target = `${baseDir}${finalName}`;
          await FileSystem.moveAsync({ from: tmpPath, to: target });
        }
      }

      await showDownloadComplete(target);
    } catch (err) {
      const raw = String(err?.message || "");
      const isFsMissing = raw === "FILESYSTEM_UNAVAILABLE_REBUILD_CLIENT";
      Alert.alert(
        "Download failed",
        isFsMissing
          ? "File system module is not loaded. Rebuild the Expo client or restart Expo Go."
          : err?.message || "Could not download file"
      );
    }
  }

  const menuItems = useMemo(() => {
    const items = [
      {
        key: "details",
        icon: ICONS.info,
        label: "Details",
        onPress: () => setDetailsOpen(true),
      },
    ];
    if (onOpenPermissions) {
      items.push({
        key: "permissions",
        icon: ICONS.people,
        label: "Permissions",
        onPress: () => onOpenPermissions(item),
      });
    }
    if (onToggleStar) {
      items.push({
        key: "star",
        icon: ICONS.star,
        label: isStarred ? "Unstar" : "Star",
        onPress: () => onToggleStar(item),
      });
    }
    if (!isBinView && item?.type === "file") {
      items.push({
        key: "download",
        icon: ICONS.download,
        iconSize: 20,
        label: "Download",
        onPress: handleDownload,
      });
    }
    if (!isBinView && onRenameSuccess) {
      items.push({
        key: "rename",
        icon: ICONS.rename,
        label: "Rename",
        onPress: () => setRenameOpen(true),
      });
    }
    if (!isBinView && onMove) {
      items.push({
        key: "move",
        icon: ICONS.move,
        iconSize: 24,
        label: "Move",
        onPress: () => onMove(item),
      });
    }
    if (isBinView && onRestoreFromBin) {
      items.push({
        key: "restore",
        icon: ICONS.restore,
        label: "Restore",
        onPress: () => onRestoreFromBin(item),
      });
    }
    if (isBinView && onDeleteForever) {
      items.push({
        key: "delete_forever",
        icon: ICONS.delete,
        label: "Delete forever",
        onPress: () => onDeleteForever(item),
      });
    } else if (!isBinView && onMoveToBin) {
      items.push({
        key: "bin",
        icon: ICONS.bin,
        label: "Move to bin",
        onPress: () => onMoveToBin(item),
      });
    }
    return items;
  }, [
    isBinView,
    isStarred,
    item,
    onMoveToBin,
    onDeleteForever,
    onMove,
    onOpenPermissions,
    onRestoreFromBin,
    onToggleStar,
  ]);

  useEffect(() => {
    let cancelled = false;
    async function loadDetails() {
      if (!detailsOpen || !item?.id) return;
      try {
        const perms = await getPermissions(item.id);
        if (cancelled) return;
        if (!Array.isArray(perms) || !ownerId) {
          setDetailsShared(null);
          return;
        }
        const hasNonOwner = perms.some((p) => String(p.userId) !== ownerId);
        setDetailsShared(hasNonOwner);
      } catch {
        if (!cancelled) setDetailsShared(null);
      }
    }
    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [detailsOpen, item?.id, ownerId]);

  return (
    <>
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: colors.surface,
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
          flex: isGrid ? 1 : undefined,
          marginHorizontal: isGrid ? 6 : 0,
          minHeight: isGrid ? 120 : undefined,
        }}
      >
        {isGrid ? (
          <View style={{ alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 24 }}>{isFolder ? ICONS.folder : isImage ? ICONS.image : ICONS.file}</Text>
            <Text
              style={{ color: colors.textPrimary, fontSize: 14, textAlign: "center" }}
              numberOfLines={2}
            >
              {item?.name}
            </Text>
            {showOwnerAvatar && ownerUser && (
              <Avatar user={ownerUser} size="sm" />
            )}
            {timestampLabel && (
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                {timestampLabel}
              </Text>
            )}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {isStarred && (
                <MaterialIcons name="star" size={14} color="#f4c542" />
              )}
              {isShared && (
                <MaterialIcons name="people" size={14} color={colors.textSecondary} />
              )}
            </View>
            {menuItems.length > 0 && (
              <Pressable
                onPress={(event) => {
                  event.stopPropagation?.();
                  setMenuOpen(true);
                }}
                hitSlop={8}
                style={{ position: "absolute", top: 6, right: 6 }}
              >
                <MaterialIcons name="more-vert" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 20 }}>{isFolder ? ICONS.folder : isImage ? ICONS.image : ICONS.file}</Text>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text
                  style={{ color: colors.textPrimary, fontSize: 15, flexShrink: 1 }}
                  numberOfLines={1}
                >
                  {item?.name}
                </Text>
                {isStarred && (
                  <MaterialIcons name="star" size={14} color="#f4c542" />
                )}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                {isShared && (
                  <MaterialIcons name="people" size={14} color={colors.textSecondary} />
                )}
                {timestampLabel && (
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {timestampLabel}
                  </Text>
                )}
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {showOwnerAvatar && ownerUser && (
                <Avatar user={ownerUser} size="sm" />
              )}
              {menuItems.length > 0 && (
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation?.();
                    setMenuOpen(true);
                  }}
                  hitSlop={8}
                >
                  <MaterialIcons name="more-vert" size={20} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>
          </View>
        )}
      </Pressable>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          onPress={() => setMenuOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          >
            {menuItems.map((menuItem) => (
              <Pressable
                key={menuItem.key}
                onPress={() => {
                  setMenuOpen(false);
                  menuItem.onPress();
                }}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  {menuItem.icon && (
                    <Text style={{ fontSize: menuItem.iconSize || 18 }}>
                      {menuItem.icon}
                    </Text>
                  )}
                  <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
                    {menuItem.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
      <RenameModal
        visible={renameOpen}
        itemId={item?.id}
        initialName={item?.name}
        onClose={() => setRenameOpen(false)}
        onSuccess={(newName) => {
          onRenameSuccess?.(item, newName);
        }}
      />

      <BottomSheet
        visible={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setDetailsShared(null);
        }}
        titleLeft="Details"
        titleRight="Close"
        heightPercent={0.55}
      >
        <View style={{ width: "100%", gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <MaterialIcons
                name={getDetailsIconName(item)}
                size={24}
                color={colors.textSecondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary }}>
                {item?.name || "Untitled"}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                {item?.type === "folder" ? "Folder" : "File"}
              </Text>
            </View>
          </View>

          <View style={{ gap: 16 }}>
            <DetailRow label="Type" value={item?.type || ICONS.dash} />
            {item?.type === "file" && (
              <DetailRow label="Content" value={item?.contentType || ICONS.dash} />
            )}
            <DetailRow label="Created" value={createdAtLabel || ICONS.dash} />
            <DetailRow label="Last opened" value={lastOpenedLabel || ICONS.dash} />
            <DetailRow
              label="Shared"
              value={(detailsShared ?? isShared) ? "Yes" : "No"}
            />
            <DetailRow label="Starred" value={isStarred ? "Yes" : "No"} />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              Owner
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Avatar
                user={{
                  id: item?.ownerId,
                  displayName: item?.ownerName || "Me",
                  email: item?.ownerEmail,
                  image: item?.ownerImage,
                }}
                size="md"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: colors.textPrimary }}>
                  {item?.ownerName || "Me"}
                </Text>
                {item?.ownerEmail && (
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {item.ownerEmail}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
      <Text style={{ fontSize: 14, color: "#6b7280" }}>{label}</Text>
      <Text style={{ fontSize: 14, color: "#111827", flexShrink: 1, textAlign: "right" }}>
        {value}
      </Text>
    </View>
  );
}

function formatDateTime(value) {
  if (!value) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  try {
    return dt.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function getDetailsIconName(item) {
  if (item?.type === "folder") return "folder";
  if (item?.contentType === "image") return "image";
  if (item?.contentType === "text") return "description";
  return "insert-drive-file";
}

function detectMimeFromName(name) {
  const lower = String(name || "").toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

function isImageFilename(name) {
  const lower = String(name || "").toLowerCase();
  return (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".bmp")
  );
}

async function openRawInBrowser(fileId) {
  if (!fileId) return false;
  try {
    const data = await getDownloadUrl(fileId);
    const url = data?.url;
    if (!url) return false;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

function askDownloadChoice() {
  return new Promise((resolve) => {
    Alert.alert(
      "Download",
      "Choose how you want to download this file.",
      [
        { text: "In app", onPress: () => resolve("app") },
        { text: "In browser", onPress: () => resolve("browser") },
        { text: "Cancel", style: "cancel", onPress: () => resolve("cancel") },
      ],
      { cancelable: true }
    );
  });
}

function confirmBrowserDownload() {
  return new Promise((resolve) => {
    Alert.alert(
      "Download in browser",
      "This will open your browser to download the file.",
      [
        { text: "Open", onPress: () => resolve(true) },
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      ],
      { cancelable: true }
    );
  });
}

async function downloadToPath(fileId, targetPath) {
  const token = getToken();
  if (!token || !fileId) {
    throw new Error("UNAUTHORIZED");
  }
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL_MISSING");
  }
  const url = `${baseUrl}/files/${fileId}/raw`;
  const res = await FileSystem.downloadAsync(url, targetPath, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status !== 200) {
    throw new Error(`DOWNLOAD_FAILED_${res.status}`);
  }
  return res;
}

async function downloadToTemp(fileName, fileId) {
  const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  if (!baseDir) {
    throw new Error("STORAGE_UNAVAILABLE");
  }
  const tmpPath = `${baseDir}${Date.now()}_${fileName}`;
  const res = await downloadToPath(fileId, tmpPath);
  return { uri: res.uri, headers: res.headers || {} };
}

async function showDownloadComplete(targetPath) {
  Alert.alert(
    "Downloaded",
    `Saved to ${targetPath}`,
    [
      {
        text: "Open",
        onPress: async () => {
          await openDownloadedFile(targetPath);
        },
      },
      { text: "OK", style: "cancel" },
    ],
    { cancelable: true }
  );
}

async function openDownloadedFile(targetPath) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(targetPath);
    return;
  }
  if (Platform.OS === "android") {
    const contentUri = await FileSystem.getContentUriAsync(targetPath);
    await Linking.openURL(contentUri);
    return;
  }
  await Linking.openURL(targetPath);
}

function getHeaderMime(headers) {
  if (!headers) return null;
  return headers["Content-Type"] || headers["content-type"] || null;
}

function ensureNameHasExtension(name, mimeType) {
  if (/\.[A-Za-z0-9]+$/.test(name)) {
    return name;
  }
  const ext = extensionForMime(mimeType);
  return ext ? `${name}.${ext}` : name;
}

function extensionForMime(mimeType) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/gif":
      return "gif";
    case "application/pdf":
      return "pdf";
    case "text/plain":
      return "txt";
    default:
      return null;
  }
}

function inferMimeFromItem(item) {
  if (item?.contentType === "image") return "image/jpeg";
  if (item?.contentType === "text") return "text/plain";
  return null;
}
