import { useEffect, useRef, useState, useContext } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from "../../theme/themeContext";
import { updateFileContent } from "../../api/filesApi";

export default function TextFileViewer({ item }) {
  if (item.type === "image") {
    return null;
  }
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);
  const saveTimerRef = useRef(null);

  const [content, setContent] = useState(item.content || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setContent(item.content || "");
  }, [item.content]);

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
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
  }, [content, item.content, item.id]);



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
        onPress={() => inputRef.current?.focus()}
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
            placeholder="Tap to edit..."
            placeholderTextColor={colors.textSecondary}
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
