import { StyleSheet } from "react-native";
import { ms } from "../../utils/scale";

export function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
    container: {
      flex: 1, // Allows pushing logout to bottom
      alignItems: "center",
      paddingTop: spacing.md,
    },

    /* Email shown above avatar */
    email: {
      fontSize: typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
      textAlign: "center",
      letterSpacing: 0.2,
    },

    /* Greeting text */
    greeting: {
      marginTop: spacing.md,
      fontSize: typography.title,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: spacing.xl,
    },

    avatarPressable: {
      alignItems: "center",
      justifyContent: "center",
    },

    avatarBadge: {
      position: "absolute",
      bottom: ms(2),
      left: ms(2),
      width: ms(34),
      height: ms(34),
      borderRadius: ms(17),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",

      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },

    avatarBadgeIcon: {
      fontSize: ms(16),
      color: colors.textPrimary,
    },

    imageActionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: ms(8),
      width: "100%",
      paddingHorizontal: spacing.xl,
      marginTop: spacing.md,
    },

    imageActionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: ms(12),
      paddingVertical: ms(10),
      gap: ms(4),
    },

    imageActionText: {
      color: colors.primary,
      fontWeight: "500",
      fontSize: ms(13),
      textAlign: "center",
      width: "100%",
    },

    removeImageRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(6),
      marginTop: spacing.sm,
    },

    removeImageText: {
      color: colors.error,
      textAlign: "center",
      fontSize: ms(13),
      fontWeight: "600",
    },

    errorText: {
      color: colors.error,
      fontSize: ms(12),
      marginTop: spacing.xs,
      textAlign: "center",
    },

    /* Placeholder for future content (logo / actions) */
    placeholder: {
      flex: 1,
      justifyContent: "center",
      opacity: 1,
      width: "100%",
      minHeight: 200,
      alignItems: "center",
    },
    gif: {
      width: 220,
      height: 120,
    },

    /* Logout button pinned to bottom */
    logoutButton: {
      marginTop: "auto",
      marginBottom: spacing.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.round,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,

      // iOS shadow
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,

      // Android
      elevation: 2,
    },

    logoutText: {
      fontSize: typography.body,
      fontWeight: "600",
      color: colors.textPrimary,
    },
  });
}
