import { useEffect, useRef, useState, useContext } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from "../../Theme/themeContext";
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
    <Pressable
      onPress={() => inputRef.current?.focus()}
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
    </Pressable>
  );
}
