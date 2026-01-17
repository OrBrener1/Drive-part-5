import { StyleSheet } from "react-native";

/**
 * Styles factory for LoginScreen.
 * Receives colors from ThemeContext so all styles
 * are fully theme-driven (light / dark / future themes).
 */
export const createStyles = (colors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },

    logo: {
      width: 180,
      height: 80,
      marginBottom: 20,
    },

    card: {
      width: "90%",
      maxWidth: 400,
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 16,
    },

    title: {
      fontSize: 28,
      fontWeight: "600",
      textAlign: "center",
      color: colors.textPrimary,
    },

    subtitle: {
      textAlign: "center",
      color: colors.textSecondary,
      marginVertical: 8,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 14,
      marginTop: 16,
      color: colors.textPrimary,
    },

    validationText: {
      fontSize: 13,
      marginTop: 6,
    },

    formError: {
      color: colors.error,
      marginTop: 8,
      textAlign: "center",
    },

    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      marginTop: 24,
      alignItems: "center",
    },

    buttonDisabled: {
      backgroundColor: colors.primaryDisabled,
    },

    buttonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
  });
