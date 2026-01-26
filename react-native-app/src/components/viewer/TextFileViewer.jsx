import { useEffect, useRef, useState, useContext } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from "../../theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import { getFileById, getPermissions, updateFileContent } from "../../api/filesApi";

export default function TextFileViewer({ item }) {
  if (item.type === "image") {
    return null;
  }
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);
  const saveTimerRef = useRef(null);

  const [content, setContent] = useState(item.content || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [canEdit, setCanEdit] = useState(true);
  const [permStatus, setPermStatus] = useState("idle");

  async function resolvePermissionType(startItem, userId, userEmail) {
    const visited = new Set();
    let current = startItem;

    for (let guard = 0; current?.id && guard < 20; guard += 1) {
      if (visited.has(current.id)) break;
      visited.add(current.id);

      const perms = await getPermissions(current.id);
      const match = (perms || []).find((p) => {
        const sameUserId = String(p.userId) === String(userId);
        const sameEmail = userEmail
          ? String(p.user?.email || "").toLowerCase() === String(userEmail).toLowerCase()
          : false;
        return sameUserId || sameEmail;
      });

      if (match?.type) return match.type;

      if (current?.ownerId && String(current.ownerId) === String(userId)) {
        return "ADMIN";
      }

      if (!current?.parentId) break;
      current = await getFileById(current.parentId);
    }

    return null;
  }

  useEffect(() => {
    setContent(item.content || "");
  }, [item.content]);

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      if (!canEdit) return;
      if (content === (item.content || "")) return;
      try {
        setSaving(true);
        setSaveError("");
        await updateFileContent(item.id, content);
      } catch (err) {
        setSaveError(err?.message || "Failed to save");
      } finally {
        setSaving(false);
      }
    }, 600);

    return () => clearTimeout(saveTimerRef.current);
  }, [canEdit, content, item.content, item.id]);

  useEffect(() => {
    let cancelled = false;

    async function resolveAccess() {
      if (!item?.id) return;

      const userId = user?.id || user?._id;
      if (!userId) {
        setCanEdit(false);
        return;
      }

      if (item?.ownerId && String(item.ownerId) === String(userId)) {
        setCanEdit(true);
        return;
      }

      setPermStatus("loading");
      setCanEdit(false);

      try {
        const permType = await resolvePermissionType(item, userId, user?.email);
        if (cancelled) return;
        setCanEdit(permType === "WRITE" || permType === "ADMIN");
      } catch {
        if (!cancelled) setCanEdit(false);
      } finally {
        if (!cancelled) setPermStatus("done");
      }
    }

    resolveAccess();
    return () => {
      cancelled = true;
    };
  }, [item?.id, item?.ownerId, item?.parentId, user?._id, user?.email, user?.id]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 10,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              marginRight: 8,
            }}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.textSecondary} />
          </Pressable>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "600" }}
              numberOfLines={1}
            >
              {item.name || "Text file"}
            </Text>
            {saving ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary }}>Saving...</Text>
              </View>
            ) : saveError ? (
              <Text style={{ color: colors.error, marginTop: 2 }}>
                {saveError}
              </Text>
            ) : permStatus === "loading" ? (
              <Text style={{ color: colors.textSecondary, marginTop: 2 }}>
                Checking access...
              </Text>
            ) : !canEdit ? (
              <Text style={{ color: colors.textSecondary, marginTop: 2 }}>
                Read-only access
              </Text>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                <Text style={{ color: colors.textSecondary }}>Saved</Text>
                <Text style={{ color: colors.textSecondary }}>✓</Text>
              </View>
            )}
          </View>

          <View style={{ width: 34, height: 34 }} />
        </View>
      </View>

      <Pressable
        onPress={canEdit ? () => inputRef.current?.focus() : undefined}
        disabled={!canEdit}
        style={{
          flex: 1,
          paddingTop: 12,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            marginHorizontal: 4,
          }}
        >
          <TextInput
            ref={inputRef}
            multiline
            value={content}
            onChangeText={setContent}
            placeholder={canEdit ? "Tap to edit..." : "View only"}
            placeholderTextColor={colors.textSecondary}
            editable={canEdit}
            showSoftInputOnFocus={canEdit}
            style={{
              flex: 1,
              fontFamily: "monospace",
              fontSize: 14,
              lineHeight: 20,
              color: colors.textPrimary,
              textAlignVertical: "top",
            }}
          />
        </View>
      </Pressable>
    </View>
  );
}
