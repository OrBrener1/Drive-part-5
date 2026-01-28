// Reusable UI component: Create Menu.

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../theme/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateMenu({
  visible,
  onClose,
  onCreateFile,
  onCreateFolder,
  onUploadFile,
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const backdrop = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)])
    .current;

  const items = useMemo(
    () => [
      {
        key: "file",
        label: "Create file",
        icon: "note-add",
        onPress: onCreateFile,
        offset: { x: -8, y: -126 },
      },
      {
        key: "folder",
        label: "Create folder",
        icon: "create-new-folder",
        onPress: onCreateFolder,
        offset: { x: -110, y: -66 },
      },
      {
        key: "upload",
        label: "Upload file",
        icon: "file-upload",
        onPress: onUploadFile,
        offset: { x: -160, y: -8 },
      },
    ],
    [onCreateFile, onCreateFolder, onUploadFile]
  );

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.stagger(
          60,
          itemAnims.map((anim) =>
            Animated.spring(anim, {
              toValue: 1,
              useNativeDriver: true,
              friction: 6,
              tension: 120,
            })
          )
        ),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.stagger(
          40,
          [...itemAnims].reverse().map((anim) =>
            Animated.timing(anim, {
              toValue: 0,
              duration: 120,
              useNativeDriver: true,
            })
          )
        ),
      ]).start(({ finished }) => {
        if (finished) {
          setMounted(false);
        }
      });
    }
  }, [backdrop, itemAnims, mounted, visible]);

  if (!mounted) return null;

  const FAB_SIZE = 56;
  const ITEM_SIZE = 46;
  const fabRight = 20;
  const fabBottom = insets.bottom + 20;
  const itemRight = fabRight + (FAB_SIZE - ITEM_SIZE) / 2;
  const itemBottom = fabBottom + (FAB_SIZE - ITEM_SIZE) / 2;

  return (
    <Modal transparent animationType="none" visible={mounted} onRequestClose={onClose}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[styles.backdrop, { opacity: backdrop }]}
        />
        <Pressable onPress={onClose} style={StyleSheet.absoluteFillObject} />

        {items.map((item, index) => {
          const anim = itemAnims[index];
          const translateX = Animated.multiply(anim, item.offset.x);
          const translateY = Animated.multiply(anim, item.offset.y);
          const scale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
          });
          const disabled = typeof item.onPress !== "function";

          return (
            <Animated.View
              key={item.key}
              style={{
                position: "absolute",
                right: itemRight,
                bottom: itemBottom,
                opacity: anim,
                transform: [{ translateX }, { translateY }, { scale }],
              }}
            >
              <Pressable
                onPress={item.onPress}
                disabled={disabled}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    marginRight: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 2,
                  }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: 13 }}>
                    {item.label}
                  </Text>
                </View>
                <View
                  style={{
                    width: ITEM_SIZE,
                    height: ITEM_SIZE,
                    borderRadius: ITEM_SIZE / 2,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    elevation: 6,
                  }}
                >
                  <MaterialIcons name={item.icon} size={22} color="#fff" />
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
});
