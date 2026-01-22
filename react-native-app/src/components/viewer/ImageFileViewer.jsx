import { View, Image, StyleSheet, Pressable, Text, Alert } from "react-native";
import { useContext, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../Theme/ThemeContext";
import * as DocumentPicker from "expo-document-picker";
import { replaceImage } from "../../api/filesApi";
import { useState } from "react";

export default function ImageFileViewer({ item }) {
  const { token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const [refreshKey, setRefreshKey] = useState(0);

  const imageUrl = useMemo(() => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || "";
    const normalized = baseUrl.replace(/\/+$/, "");
    return `${normalized}/files/${item.id}/raw`;
  }, [item.id]);
  const dataUri = useMemo(() => {
    if (!item?.content) return null;
    const mimeType = detectMimeFromBase64(item.content);
    return `data:${mimeType};base64,${item.content}`;
  }, [item?.content]);

  async function onReplacePress() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      await replaceImage(item.id, result.assets[0]);

      // Force reload of <Image />
      setRefreshKey((k) => k + 1);
    } catch (err) {
      Alert.alert("Replace failed", err.message);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        key={refreshKey}
        source={{
          uri: dataUri || imageUrl,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }}
        style={styles.image}
        resizeMode="contain"
        onError={(e) => {
          console.warn("Image load failed", e?.nativeEvent?.error);
        }}
      />

      {/* Replace button */}
      <Pressable
        style={[styles.replaceButton, { backgroundColor: colors.surface }]}
        onPress={onReplacePress}
      >
        <Text style={[styles.replaceText, { color: colors.textPrimary }]}>
          Replace
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  replaceButton: {
    position: "absolute",
    top: 16,
    right: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  replaceText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

function detectMimeFromBase64(base64) {
  const head = String(base64).slice(0, 10);
  if (head.startsWith("/9j/")) return "image/jpeg";
  if (head.startsWith("iVBOR")) return "image/png";
  if (head.startsWith("R0lG")) return "image/gif";
  return "image/png";
}
