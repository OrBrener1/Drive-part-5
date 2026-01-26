import { useEffect, useRef, useState, useContext } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
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
    <Pressable
      onPress={canEdit ? () => inputRef.current?.focus() : undefined}
      disabled={!canEdit}
      style={{
        flex: 1,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 16,
        backgroundColor: colors.background,
      }}
    >
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>
          {item.name || "Text file"}
        </Text>
        {saving ? (
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
            Saving...
          </Text>
        ) : permStatus === "loading" ? (
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
            Checking access...
          </Text>
        ) : !canEdit ? (
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
            Read-only access
          </Text>
        ) : saveError ? (
          <Text style={{ color: colors.error, marginTop: 4 }}>
            {saveError}
          </Text>
        ) : null}
      </View>

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
    </Pressable>
  );
}
