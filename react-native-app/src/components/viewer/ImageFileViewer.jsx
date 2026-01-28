import { View, Image, StyleSheet, Pressable, Text, Alert, Animated, Easing, I18nManager } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useContext, useMemo, useRef, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../theme/themeContext";
import * as DocumentPicker from "expo-document-picker";
import { replaceImage } from "../../api/filesApi";
import { useState } from "react";
import { router } from "expo-router";

export default function ImageFileViewer({ item, onRefresh }) {
  const { token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const [refreshKey, setRefreshKey] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [replacing, setReplacing] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

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

  useEffect(() => {
    setImageLoading(true);
  }, [item?.id, refreshKey]);

  useEffect(() => {
    if (!imageLoading && !replacing) {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [imageLoading, replacing, spinAnim]);

  async function onReplacePress() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setReplacing(true);
      await replaceImage(item.id, result.assets[0]);
      await onRefresh?.();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      Alert.alert("Replace failed", err.message);
    } finally {
      setReplacing(false);
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
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
        }}
      />

      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        {/* Replace button */}
        <Pressable
          style={[styles.topButton, { backgroundColor: colors.surface }]}
          onPress={onReplacePress}
          disabled={imageLoading || replacing}
        >
          <Text style={[styles.topButtonText, { color: colors.textPrimary }]}>
            Replace
          </Text>
        </Pressable>

        {/* Back button (always right) */}
        <Pressable
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
          disabled={imageLoading || replacing}
        >
          <MaterialIcons
            name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"}
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      {(imageLoading || replacing) && (
        <View
          style={[styles.loadingOverlay, { backgroundColor: colors.background }]}
          pointerEvents="auto"
        >
          <Animated.Image
            source={require("../../../assets/squirl.png")}
            style={{
              width: 300,
              height: 300,
              transform: [
                {
                  rotate: spinAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
            resizeMode="contain"
          />
          <Text style={{ color: colors.textSecondary, marginTop: 10, fontSize: 16 }}>
            Loading...
          </Text>
        </View>
      )}
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
  topButton: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
  },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});

function detectMimeFromBase64(base64) {
  const head = String(base64).slice(0, 10);
  if (head.startsWith("/9j/")) return "image/jpeg";
  if (head.startsWith("iVBOR")) return "image/png";
  if (head.startsWith("R0lG")) return "image/gif";
  return "image/png";
}
