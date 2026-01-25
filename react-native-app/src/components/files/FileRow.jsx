import { useContext, useMemo, useState } from "react";
import { Alert, Modal, Platform, Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../theme/themeContext";
import RenameModal from "./RenameModal";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { downloadFileRaw } from "../../api/filesApi";

export default function FileRow({
  item,
  onPress,
  onOpenPermissions,
  onToggleStar,
  onMoveToBin,
  onRestoreFromBin,
  onDeleteForever,
  onRenameSuccess,
  onUnauthorized,
  listContext = "default",
  currentUserId,
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const isFolder = item?.type === "folder";
  const isStarred = Boolean(item?.isStarred);
  const isShared = currentUserId && String(item?.ownerId) !== String(currentUserId);
  const isBinView = listContext === "bin";

  async function handleDownload() {
    try {
      console.log("DOWNLOAD dirs", {
        documentDirectory: FileSystem.documentDirectory,
        cacheDirectory: FileSystem.cacheDirectory,
      });
      const fileName = String(item?.name || `file_${item?.id}`)
        .replace(/[\\/:*?"<>|]/g, "_");
      const blob = await downloadFileRaw(item?.id);
      const dataUrl = await readBlobAsDataUrl(blob);
      const base64 = dataUrl.split(",")[1] || "";
      let target = null;

      if (Platform.OS === "android") {
        const saf = FileSystem.StorageAccessFramework;
        if (!saf?.requestDirectoryPermissionsAsync) {
          throw new Error("STORAGE_PERMISSION_UNSUPPORTED");
        }
        const permission = await saf.requestDirectoryPermissionsAsync();
        if (!permission.granted) {
          throw new Error("STORAGE_PERMISSION_DENIED");
        }
        const mimeType = detectMimeFromName(fileName);
        target = await saf.createFileAsync(
          permission.directoryUri,
          fileName,
          mimeType
        );
        await FileSystem.writeAsStringAsync(target, base64, {
          encoding: "base64",
        });
      } else {
        const baseDir = FileSystem.documentDirectory;
        if (!baseDir) {
          throw new Error("STORAGE_UNAVAILABLE");
        }
        target = `${baseDir}${fileName}`;
        await FileSystem.writeAsStringAsync(target, base64, {
          encoding: "base64",
        });
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(target);
      } else {
        Alert.alert("Downloaded", `Saved to ${target}`);
      }
    } catch (err) {
      Alert.alert("Download failed", err?.message || "Could not download file");
    }
  }

  const menuItems = useMemo(() => {
    const items = [];
    if (onOpenPermissions) {
      items.push({
        key: "permissions",
        label: "Access & Permissions",
        onPress: () => onOpenPermissions(item),
      });
    }
    if (onToggleStar) {
      items.push({
        key: "star",
        label: isStarred ? "Unstar" : "Star",
        onPress: () => onToggleStar(item),
      });
    }
    if (!isBinView && item?.type === "file") {
      items.push({
        key: "download",
        label: "Download",
        onPress: handleDownload,
      });
    }
    if (!isBinView && onRenameSuccess) {
      items.push({
        key: "rename",
        label: "Rename",
        onPress: () => setRenameOpen(true),
      });
    }
    if (isBinView && onRestoreFromBin) {
      items.push({
        key: "restore",
        label: "Restore",
        onPress: () => onRestoreFromBin(item),
      });
    }
    if (isBinView && onDeleteForever) {
      items.push({
        key: "delete_forever",
        label: "Delete forever",
        onPress: () => onDeleteForever(item),
      });
    } else if (!isBinView && onMoveToBin) {
      items.push({
        key: "bin",
        label: "Move to Bin",
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
    onOpenPermissions,
    onRestoreFromBin,
    onToggleStar,
  ]);

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
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <MaterialIcons
            name={isFolder ? "folder" : "insert-drive-file"}
            size={22}
            color={colors.textSecondary}
          />

          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 15 }} numberOfLines={1}>
              {item?.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
              {isStarred && (
                <MaterialIcons name="star" size={14} color={colors.primary} />
              )}
              {isShared && (
                <MaterialIcons name="people" size={14} color={colors.textSecondary} />
              )}
            </View>
          </View>

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
                <Text style={{ color: colors.textPrimary, fontSize: 15 }}>
                  {menuItem.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
      <RenameModal
        visible={renameOpen}
        itemId={item?.id}
        initialName={item?.name}
        onUnauthorized={onUnauthorized}
        onClose={() => setRenameOpen(false)}
        onSuccess={(newName) => {
          onRenameSuccess?.(item, newName);
        }}
      />
    </>
  );
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
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
