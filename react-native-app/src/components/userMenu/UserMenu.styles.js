import { StyleSheet } from "react-native";

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
