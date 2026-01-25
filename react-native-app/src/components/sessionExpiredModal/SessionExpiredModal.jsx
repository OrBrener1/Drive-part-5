import { useContext } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { ThemeContext } from "../../Theme/themeContext";

export default function SessionExpiredModal({ visible, onConfirm }) {
  const { theme } = useContext(ThemeContext);
  const { colors, spacing, radius, typography } = theme;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.lg,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 380,
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: typography.title,
              fontWeight: "700",
              marginBottom: spacing.sm,
            }}
          >
            Session ended ⚠️
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.small,
              marginBottom: spacing.md,
            }}
          >
            Please log in again.
          </Text>

          <Pressable
            onPress={onConfirm}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: spacing.sm,
              borderRadius: radius.md,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.onPrimary, fontWeight: "600" }}>
              Log in
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
