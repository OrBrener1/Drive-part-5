// Styles are generated from theme (colors, spacing, radius, typography)
import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

export function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "flex-end",
    },

    sheet: {
      height: height * 0.65,
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: spacing.sm,
    },

    headerLeft: {
      fontSize: typography.small,
      color: colors.textSecondary,
    },

    headerRight: {
      fontSize: typography.body,
      fontWeight: "600",
      color: colors.primary,
    },

    content: {
      flex: 1,
      alignItems: "center",
    },
  });
}
